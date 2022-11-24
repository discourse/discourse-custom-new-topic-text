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
      this.setNewTopicButtonLabel();
    },

    setNewTopicButtonLabel() {
      if (
        ["discovery.category", "discovery.categoryNone"].includes(
          this.router.get("currentRouteName")
        )
      ) {
        let hierarchy = this.fetchCategoryHierarchy(
          this.router.get("currentRoute.attributes.category")
        );
        let text = "";
        let categorySlug = hierarchy
          .map((c) => c.slug)
          .reverse()
          .join("/");
        if (categorySlug && (text = categoryTexts[categorySlug])) {
          this.set("label", themePrefix(text));
        }
      }
    },

    fetchCategoryHierarchy(category) {
      const hierarchy = [category];
      let catIter = category;
      while (catIter.parentCategory) {
        hierarchy.push(catIter.parentCategory);
        catIter = catIter.parentCategory;
      }

      return hierarchy;
    },
  });
};
