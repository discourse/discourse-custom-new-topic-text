import { getOwner } from "@ember/application";
import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "custom-new-topic-text",
  initialize() {
    withPluginApi("0.11.0", newTopicButton);
  },
};

const newTopicButton = (api) => {
  const overrideTexts = settings.newtopic_override_texts;
  if (!overrideTexts.length) {
    return;
  }

  const categoryTexts = {};

  overrideTexts.split("|").map((frag) => {
    const item = frag.split(",");
    categoryTexts[item[0]] = item[1];
  });

  api.modifyClass("component:d-navigation", {
    get createTopicLabel() {
      return (
        this.customLabel ||
        (this.hasDraft ? "topic.open_draft" : "topic.create")
      );
    },

    get customLabel() {
      const discoveryService = getOwner(this).lookup("service:discovery");
      if (discoveryService.category) {
        let hierarchy = this.fetchCategoryHierarchy(discoveryService.category);
        let text = "";
        let categorySlug = hierarchy
          .map((c) => c.slug)
          .reverse()
          .join("/");
        if (categorySlug && (text = categoryTexts[categorySlug])) {
          return themePrefix(text);
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
