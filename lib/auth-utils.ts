export const auth = () => {
  return {
    signOut: async () => {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      window.location.href = "/login";
    },
  };
};
