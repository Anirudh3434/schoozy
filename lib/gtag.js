// lib/gtag.js

export const GA_TRACKING_ID = "G-FWH11SCDCG"; // <-- अपना GA ID डालो

// Pageview track करना
export const pageview = (url) => {
  window.gtag("config", GA_TRACKING_ID, {
    page_path: url,
  });
};

// Events track करना (future use के लिए)
export const event = ({ action, category, label, value }) => {
  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};
