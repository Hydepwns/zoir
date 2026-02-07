use std::fs;
use zed_extension_api::{
    self as zed, serde_json, settings::LspSettings, Command, LanguageServerId, Result, Worktree,
};

struct ZoirExtension {
    cached_binary_path: Option<String>,
}

impl ZoirExtension {
    fn language_server_binary_path(
        &mut self,
        language_server_id: &LanguageServerId,
        worktree: &Worktree,
    ) -> Result<String> {
        // Try PATH first (respects noirup installations)
        if let Some(path) = worktree.which("nargo") {
            return Ok(path);
        }

        // Try cached path
        if let Some(path) = &self.cached_binary_path {
            if fs::metadata(path).is_ok() {
                return Ok(path.clone());
            }
        }

        // Download from GitHub releases
        zed::set_language_server_installation_status(
            language_server_id,
            &zed::LanguageServerInstallationStatus::CheckingForUpdate,
        );

        let release = zed::latest_github_release(
            "noir-lang/noir",
            zed::GithubReleaseOptions {
                require_assets: true,
                pre_release: false,
            },
        )?;

        let (platform, arch) = zed::current_platform();
        let asset_name = match (platform, arch) {
            (zed::Os::Mac, zed::Architecture::Aarch64) => "nargo-aarch64-apple-darwin.tar.gz",
            (zed::Os::Mac, zed::Architecture::X8664) => "nargo-x86_64-apple-darwin.tar.gz",
            (zed::Os::Linux, zed::Architecture::Aarch64) => {
                "nargo-aarch64-unknown-linux-gnu.tar.gz"
            }
            (zed::Os::Linux, zed::Architecture::X8664) => "nargo-x86_64-unknown-linux-gnu.tar.gz",
            _ => return Err(format!("unsupported platform: {:?} {:?}", platform, arch)),
        };

        let asset = release
            .assets
            .iter()
            .find(|a| a.name == asset_name)
            .ok_or_else(|| format!("no asset found for {}", asset_name))?;

        let version_dir = format!("nargo-{}", release.version);
        let binary_path = format!("{}/nargo", version_dir);

        if !fs::metadata(&binary_path).is_ok() {
            zed::set_language_server_installation_status(
                language_server_id,
                &zed::LanguageServerInstallationStatus::Downloading,
            );

            zed::download_file(
                &asset.download_url,
                &version_dir,
                zed::DownloadedFileType::GzipTar,
            )
            .map_err(|e| format!("failed to download nargo: {}", e))?;

            zed::make_file_executable(&binary_path)?;

            // Cleanup old versions
            let entries = fs::read_dir(".")
                .map_err(|e| format!("failed to read directory: {}", e))?;

            for entry in entries.flatten() {
                let name = entry.file_name();
                let name_str = name.to_string_lossy();
                if name_str.starts_with("nargo-") && name_str != version_dir {
                    let _ = fs::remove_dir_all(entry.path());
                }
            }
        }

        self.cached_binary_path = Some(binary_path.clone());
        Ok(binary_path)
    }
}

impl zed::Extension for ZoirExtension {
    fn new() -> Self {
        Self {
            cached_binary_path: None,
        }
    }

    fn language_server_command(
        &mut self,
        language_server_id: &LanguageServerId,
        worktree: &Worktree,
    ) -> Result<Command> {
        let binary_path = self.language_server_binary_path(language_server_id, worktree)?;

        let settings = LspSettings::for_worktree("nargo", worktree)
            .ok()
            .and_then(|s| s.settings);

        let mut args = vec!["lsp".to_string()];

        // Add any custom arguments from settings
        if let Some(settings) = settings {
            if let Some(extra_args) = settings.get("args") {
                if let Some(arr) = extra_args.as_array() {
                    for arg in arr {
                        if let Some(s) = arg.as_str() {
                            args.push(s.to_string());
                        }
                    }
                }
            }
        }

        Ok(Command {
            command: binary_path,
            args,
            env: Default::default(),
        })
    }

    fn language_server_initialization_options(
        &mut self,
        _language_server_id: &LanguageServerId,
        worktree: &Worktree,
    ) -> Result<Option<serde_json::Value>> {
        let settings = LspSettings::for_worktree("nargo", worktree)
            .ok()
            .and_then(|s| s.initialization_options);
        Ok(settings)
    }

    fn language_server_workspace_configuration(
        &mut self,
        _language_server_id: &LanguageServerId,
        worktree: &Worktree,
    ) -> Result<Option<serde_json::Value>> {
        let settings = LspSettings::for_worktree("nargo", worktree)
            .ok()
            .and_then(|s| s.settings);
        Ok(settings)
    }
}

zed::register_extension!(ZoirExtension);
