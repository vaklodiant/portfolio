const toTop = document.getElementById("to-top");
const hero = document.querySelector(".hero");

if (toTop && hero) {
    const observer = new IntersectionObserver(([entry]) => {
        toTop.classList.toggle("visible", !entry.isIntersecting);
    });
    observer.observe(hero);

    toTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const id = this.getAttribute('href');
    const target = document.querySelector(id);

    window.scrollTo({
      top: target.offsetTop,
      behavior: 'smooth'
    });
  });
});

// Project gallery: fixed thumbs, main area shows active item (supports img & video)
(function () {
    const wrap = document.querySelector('.project-img-wrap');
    if (!wrap) return;

    const thumbDivs = Array.from(document.querySelectorAll('.project-thumb'));
    if (!thumbDivs.length) return;

    // Gather items: [{src, type}] — index 0 = initial main, 1..N = thumbs
    const mainChild = wrap.querySelector('img, video');
    if (!mainChild) return;

    const items = [
        { src: mainChild.src, type: mainChild.tagName.toLowerCase() },
        ...thumbDivs.map(div => {
            const el = div.querySelector('img, video');
            return el ? { src: el.src, type: el.tagName.toLowerCase() } : null;
        }).filter(Boolean)
    ];

    let activeIndex = 0;
    let cycleTimer = null;
    let idleTimer = null;
    let mainEl = mainChild;

    function stopCycle() {
        if (cycleTimer) { clearInterval(cycleTimer); cycleTimer = null; }
        if (idleTimer)  { clearTimeout(idleTimer);   idleTimer  = null; }
    }

    function startCycle() {
        stopCycle();
        cycleTimer = setInterval(() => setMain((activeIndex + 1) % items.length), 4000);
    }

    function scheduleResume() {
        if (idleTimer) clearTimeout(idleTimer);
        idleTimer = setTimeout(startCycle, 6000);
    }

    function applyMainStyles(el) {
        el.style.width      = '100%';
        el.style.height     = 'auto';
        el.style.display    = 'block';
        el.style.objectFit  = 'cover';
        el.style.transition = 'opacity 0.3s ease';
    }

    function setMain(newIndex) {
        if (newIndex === activeIndex) return;
        activeIndex = newIndex;
        const item = items[activeIndex];

        mainEl.style.opacity = '0';

        setTimeout(() => {
            if (item.type === 'video') {
                // Switch main element to video
                const vid = document.createElement('video');
                vid.src = item.src;
                vid.autoplay = true;
                vid.muted = true;
                vid.playsInline = true;
                vid.controls = false;
                applyMainStyles(vid);
                vid.style.opacity = '0';
                wrap.replaceChild(vid, mainEl);
                mainEl = vid;

                // Stop cycle while video plays; resume when it ends
                stopCycle();
                vid.addEventListener('ended', startCycle, { once: true });

            } else {
                if (mainEl.tagName === 'VIDEO') {
                    mainEl.pause();
                    const img = document.createElement('img');
                    img.src = item.src;
                    img.alt = '';
                    applyMainStyles(img);
                    img.style.opacity = '0';
                    wrap.replaceChild(img, mainEl);
                    mainEl = img;
                } else {
                    mainEl.src = item.src;
                }
            }

            mainEl.style.opacity = '1';
        }, 300);
    }

    startCycle();

    thumbDivs.forEach((div, i) => {
        div.addEventListener('click', () => {
            stopCycle();
            setMain(i + 1); // items[0] is initial main; thumbs start at index 1
            if (items[i + 1].type !== 'video') scheduleResume();
            // for video: cycle resumes via 'ended' event
        });
    });
})();

// Make projects clickable
document.querySelectorAll('.project').forEach(project => {
  project.addEventListener('click', function() {
    const projectId = this.getAttribute('data-project-id');
    // Navigate to project detail page (replace 'project' with actual page name)
    window.location.href = `project-${projectId}.html`;
  });
});