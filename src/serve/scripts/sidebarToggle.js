let sidebarOpen = false;

window.addEventListener("DOMContentLoaded", () => {
  document.querySelector("#sidebar-menu-drawer").addEventListener("click", () => {
    toggleSidebar();
  });
});

function toggleSidebar() {
  if (sidebarOpen) {
    sidebarOpen = false;
    document.querySelector("#sidebar-menu").classList.remove("opened");
    document.querySelector("#sidebar-menu-drawer").classList.remove("opened");
  } else {
    sidebarOpen = true;
    document.querySelector("#sidebar-menu").classList.add("opened");
    document.querySelector("#sidebar-menu-drawer").classList.add("opened");
  }
}
