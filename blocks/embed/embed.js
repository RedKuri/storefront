/*
 * Embed Block
 * Show videos, social posts, and Klaviyo forms
 * DA.Live / Helix compatible
 */

const loadScript = (url, callback, type) => {
  const head = document.querySelector('head');
  const script = document.createElement('script');
  script.src = url;
  if (type) script.setAttribute('type', type);
  if (callback) script.onload = callback;
  head.append(script);
  return script;
};

// Standard embeds
const getDefaultEmbed = (url) => `<div style="position:relative;width:100%;height:0;padding-bottom:56.25%;">
  <iframe src="${url.href}" style="border:0;position:absolute;top:0;left:0;width:100%;height:100%;" allowfullscreen="" scrolling="no" allow="encrypted-media" title="Content from ${url.hostname}" loading="lazy"></iframe>
</div>`;

const embedYoutube = (url, autoplay) => {
  const usp = new URLSearchParams(url.search);
  const suffix = autoplay ? '&muted=1&autoplay=1' : '';
  let vid = usp.get('v') ? encodeURIComponent(usp.get('v')) : '';
  if (url.origin.includes('youtu.be')) [, vid] = url.pathname.split('/');
  return `<div style="position:relative;width:100%;height:0;padding-bottom:56.25%;">
    <iframe src="https://www.youtube.com${vid ? `/embed/${vid}?rel=0&v=${vid}${suffix}` : url.pathname}" style="border:0;position:absolute;top:0;left:0;width:100%;height:100%;" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen="" scrolling="no" title="Content from Youtube" loading="lazy"></iframe>
  </div>`;
};

const embedVimeo = (url, autoplay) => {
  const [, video] = url.pathname.split('/');
  const suffix = autoplay ? '?muted=1&autoplay=1' : '';
  return `<div style="position:relative;width:100%;height:0;padding-bottom:56.25%;">
    <iframe src="https://player.vimeo.com/video/${video}${suffix}" style="border:0;position:absolute;top:0;left:0;width:100%;height:100%;" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="Content from Vimeo" loading="lazy"></iframe>
  </div>`;
};

const embedTwitter = (url) => {
  const embedHTML = `<blockquote class="twitter-tweet"><a href="${url.href}"></a></blockquote>`;
  loadScript('https://platform.twitter.com/widgets.js');
  return embedHTML;
};

// Load standard embed based on URL
const loadEmbed = (block, link, autoplay) => {
  if (block.classList.contains('embed-is-loaded')) return;

  const EMBEDS_CONFIG = [
    { match: ['youtube', 'youtu.be'], embed: embedYoutube },
    { match: ['vimeo'], embed: embedVimeo },
    { match: ['twitter'], embed: embedTwitter },
  ];

  const config = EMBEDS_CONFIG.find((e) => e.match.some((m) => link.includes(m)));
  const url = new URL(link);

  if (config) {
    block.innerHTML = config.embed(url, autoplay);
    block.classList = `block embed embed-${config.match[0]}`;
  } else {
    block.innerHTML = getDefaultEmbed(url);
    block.classList = 'block embed';
  }

  block.classList.add('embed-is-loaded');
};

// ---- Klaviyo support ----
const ensureKlaviyoScript = (companyId) => {
  if (document.querySelector('script[src*="static.klaviyo.com/onsite/js/klaviyo.js"]')) return;
  const script = document.createElement('script');
  script.async = true;
  script.type = 'text/javascript';
  script.src = `https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=${companyId}`;
  document.head.appendChild(script);
  console.debug('Klaviyo script injected:', script.src);
};

// ---- Main decorate function ----
export default function decorate(block) {
  const placeholder = block.querySelector('picture');
  const linkEl = block.querySelector('a');
  const klaviyoFormId = block.dataset.klaviyoForm;

  // Case: Klaviyo embed (dynamic div)
  if (klaviyoFormId) {
    console.debug('Embed block: Klaviyo form detected.');
    const klaviyoDiv = document.createElement('div');
    klaviyoDiv.className = `klaviyo-form-${klaviyoFormId}`;
    block.appendChild(klaviyoDiv);
    // Replace with your public API key
    ensureKlaviyoScript('TAN3ML');
    return; // stop further processing
  }

  // Case: Standard embed with <a>
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
}
