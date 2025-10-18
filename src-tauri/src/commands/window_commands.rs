

use tauri::{Window};
#[allow(unused_imports)]
use tauri::{Manager};

#[tauri::command]
pub fn close_window(window: Window) {
    window.close().unwrap();
}


#[tauri::command]
pub fn minimize_window(window: Window) {
    window.minimize().unwrap();
}


#[tauri::command]
 pub fn maximize_window(window: Window) {
    if window.is_maximized().unwrap() {
        window.unmaximize().unwrap();
    } else {
        window.maximize().unwrap();
    }
}
