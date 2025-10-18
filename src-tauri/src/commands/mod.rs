pub mod window_commands;

use tauri::{ipc::Invoke,generate_handler};
use window_commands::*;


pub fn get_all_commands() -> impl Fn(Invoke) -> bool {
    generate_handler![
        close_window,
        minimize_window,
        maximize_window,
    ]
}