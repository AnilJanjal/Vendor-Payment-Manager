export function loginUser(username: string) {
  localStorage.setItem("loggedInUser", username);
}

export function logoutUser() {
  localStorage.removeItem("loggedInUser");
}

export function isLoggedIn(): boolean {
  return !!localStorage.getItem("loggedInUser");
}
