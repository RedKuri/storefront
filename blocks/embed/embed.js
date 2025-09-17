export default function decorate(block) {
  const placeholder = block.querySelector('picture');
  const linkEl = block.querySelector('a');

  // ---- Case 1: Raw Klaviyo div already exists ----
  const klaviyoDiv = block.querySelector('[class^="klaviyo-form-"]');
  if (klaviyoDiv) {
    // Inject script only if not already loaded
    ensureKlaviyoScript('TAN3ML'); // replace with actual key
    return; // leave div intact
  }

  // ---- Case 2: Klaviyo via <a href="klaviyo://FORM_ID"> ----
  if (linkEl && linkEl.href.startsWith('klaviyo://')) {
    const formId = linkEl.href.split('://')[1];
    const div = document.createElement('div');
    div.className = `klaviyo-form-${formId}`;
    block.appendChild(div);
    ensureKlaviyoScript('TAN3ML');
    return;
  }

  // ---- Case 3: Standard video/social embeds ----
  if (linkEl) {
    const link = linkEl.href;
    block.textContent = '';

    if (placeholder) {
      const wrapper = document.createElement('div');
      wrapper.className = 'embed-placeholder';
      wrapper.innerHTML = '<div class="embed-placeholder-play"><button type="button" title="Play"></button></div>';
      wrapper.prepend(placeholder);
      wrapper.addEventListener('click', () => loadEmbed(block, link, true));
      block.append(wrapper);
    } else {
      const observer = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect();
          loadEmbed(block, link);
        }
      });
      observer.observe(block);
    }
  }
};
