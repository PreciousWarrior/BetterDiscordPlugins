module.exports = (Plugin, Library) => {
  return class NitroStream extends Plugin {
    onStart() {
      const userStore = BdApi.findModuleByProps("getCurrentUser");
      const user = userStore.getCurrentUser();
      this.originalType = user.premiumType;
      user.premiumType = 2;
    }
    onStop() {
      const userStore = BdApi.findModuleByProps("getCurrentUser");
      const user = userStore.getCurrentUser();
      user.premiumType = this.originalType;
    }
  };
};
