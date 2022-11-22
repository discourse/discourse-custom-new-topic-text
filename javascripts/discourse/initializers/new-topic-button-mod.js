import { withPluginApi } from "discourse/lib/plugin-api";
import { inject as service } from "@ember/service";

export default {
  name: "custom-new-topic-text",
  initialize() {
    withPluginApi("0.11.0", newTopicButton);
  },
};

const newTopicButton = (api) => {
  const overrideTexts = settings.newtopic_override_texts;
  if (!overrideTexts.length) return;

  const categoryTexts = {};

  overrideTexts.split("|").map((frag) => {
    const item = frag.split(",");
    categoryTexts[item[0]] = item[1];
  });

  api.modifyClass("component:create-topic-button", {
    router: service(),

    didInsertElement() {
      this._super(...arguments);

      if (this.router.get("currentRouteName") == "discovery.category") {
        const categorySlug = this.router.get(
          "currentRoute.attributes.category.slug"
        );
        let text = "";
        if (categorySlug && (text = categoryTexts[categorySlug])) {
          this.set("label", themePrefix(text));
        }
      }
    },
  });
};
