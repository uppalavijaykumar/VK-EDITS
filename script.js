/**
 * ============================================================================
 * VK EDITS - Interactive Cinema Engine & Portfolio Scripts
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initAudioSynthesizer();
  initTimecodeEngine();
  initTimezoneClock();
  initShowreelPlayer();
  initColorGradingSlider();
  initPortfolioFilterAndModal();
  initMetricCounters();
  initNavbarAndScrollSpy();
  initContactForm();
});

/* ----------------------------------------------------------------------------
 * 1. Custom Cinematic Cursor
 * ---------------------------------------------------------------------------- */
function initCursor() {
  const dot = document.getElementById('cursorDot');
  const circle = document.getElementById('cursorCircle');
  const cursorText = document.getElementById('cursorText');

  if (!dot || !circle || window.innerWidth < 768) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let circleX = mouseX;
  let circleY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  function renderCursor() {
    // Smooth lerp follow
    circleX += (mouseX - circleX) * 0.18;
    circleY += (mouseY - circleY) * 0.18;
    circle.style.transform = `translate(${circleX}px, ${circleY}px)`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Hover targets
  const interactiveElements = document.querySelectorAll(
    'a, button, .project-card, .slider-handle, .service-card, .radio-pill, input, select, textarea'
  );

  interactiveElements.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      circle.classList.add('cursor-hover');
      if (el.closest('.project-card') || el.classList.contains('project-card')) {
        cursorText.textContent = 'WATCH';
      } else if (el.closest('.slider-comparison-box')) {
        cursorText.textContent = 'DRAG';
      } else if (el.id === 'showreelPlayBtn' || el.closest('#showreelWrapper')) {
        cursorText.textContent = 'PLAY';
      } else {
        cursorText.textContent = 'CLICK';
      }
      playUiSound('hover');
    });

    el.addEventListener('mouseleave', () => {
      circle.classList.remove('cursor-hover');
      cursorText.textContent = 'VIEW';
    });
  });
}

/* ----------------------------------------------------------------------------
 * 2. Web Audio API Synth Effects (Zero MP3 Dependencies)
 * ---------------------------------------------------------------------------- */
let audioCtx = null;
let soundEnabled = false;

function initAudioSynthesizer() {
  const toggleBtn = document.getElementById('soundToggle');
  const soundIcon = document.getElementById('soundIcon');
  const soundLabel = toggleBtn ? toggleBtn.querySelector('.sound-label') : null;

  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    soundEnabled = !soundEnabled;

    if (soundEnabled) {
      toggleBtn.classList.add('active');
      soundIcon.className = 'fa-solid fa-volume-high';
      if (soundLabel) soundLabel.textContent = 'SFX ON';
      playUiSound('activate');
    } else {
      toggleBtn.classList.remove('active');
      soundIcon.className = 'fa-solid fa-volume-xmark';
      if (soundLabel) soundLabel.textContent = 'SFX OFF';
    }
  });
}

function playUiSound(type = 'click') {
  if (!soundEnabled || !audioCtx) return;

  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const now = audioCtx.currentTime;

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'hover') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.05);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'click') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'activate') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  } catch (e) {
    console.warn('Audio play notice', e);
  }
}

/* ----------------------------------------------------------------------------
 * 3. Dynamic Production Timecode HUD (24 FPS Counter)
 * ---------------------------------------------------------------------------- */
function initTimecodeEngine() {
  const tcElement = document.getElementById('heroTimecode');
  if (!tcElement) return;

  let hours = 1;
  let minutes = 42;
  let seconds = 19;
  let frames = 14;

  setInterval(() => {
    frames++;
    if (frames >= 24) {
      frames = 0;
      seconds++;
      if (seconds >= 60) {
        seconds = 0;
        minutes++;
        if (minutes >= 60) {
          minutes = 0;
          hours++;
        }
      }
    }

    const pad = (n) => String(n).padStart(2, '0');
    tcElement.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(frames)}`;
  }, 1000 / 24);
}

/* ----------------------------------------------------------------------------
 * 4. Client Local Timezone Clock (IST UTC+5:30)
 * ---------------------------------------------------------------------------- */
function initTimezoneClock() {
  const clockEl = document.getElementById('liveLocalTime');
  if (!clockEl) return;

  function updateClock() {
    const now = new Date();
    // Convert to IST (UTC + 5 hours 30 mins)
    const options = {
      timeZone: 'Asia/Kolkata',
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    };
    clockEl.textContent = new Intl.DateTimeFormat('en-US', options).format(now);
  }

  updateClock();
  setInterval(updateClock, 1000);
}

/* ----------------------------------------------------------------------------
 * 5. Interactive Showreel Video Player
 * ---------------------------------------------------------------------------- */
function initShowreelPlayer() {
  const video = document.getElementById('mainShowreelVideo');
  const playBtn = document.getElementById('showreelPlayBtn');
  const overlay = document.getElementById('showreelOverlay');
  const playPauseToggle = document.getElementById('playPauseToggle');
  const scrubTrack = document.getElementById('scrubContainer');
  const scrubProgress = document.getElementById('scrubProgress');
  const currentTimeDisplay = document.getElementById('currentTime');
  const durationTimeDisplay = document.getElementById('durationTime');
  const muteToggle = document.getElementById('muteToggle');
  const fullscreenToggle = document.getElementById('fullscreenToggle');
  const showreelWrapper = document.getElementById('showreelWrapper');
  const openReelBtn = document.querySelector('.open-showreel-btn');

  if (!video || !playBtn) return;

  const formatTime = (secs) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  function playReel() {
    video.muted = false;
    video.play().then(() => {
      overlay.classList.add('hidden');
      if (playPauseToggle) playPauseToggle.innerHTML = '<i class="fa-solid fa-pause"></i>';
      if (muteToggle) muteToggle.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
      playUiSound('click');
    }).catch(() => {
      // Autoplay with audio was blocked, fallback to muted
      video.muted = true;
      video.play();
      overlay.classList.add('hidden');
      if (muteToggle) muteToggle.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
    });
  }

  function pauseReel() {
    video.pause();
    overlay.classList.remove('hidden');
    if (playPauseToggle) playPauseToggle.innerHTML = '<i class="fa-solid fa-play"></i>';
    playUiSound('click');
  }

  playBtn.addEventListener('click', playReel);

  if (openReelBtn) {
    openReelBtn.addEventListener('click', (e) => {
      // scroll to showreel and start playback smoothly
      setTimeout(() => {
        playReel();
      }, 600);
    });
  }

  if (playPauseToggle) {
    playPauseToggle.addEventListener('click', () => {
      if (video.paused) {
        playReel();
      } else {
        pauseReel();
      }
    });
  }

  video.addEventListener('timeupdate', () => {
    if (video.duration) {
      const pct = (video.currentTime / video.duration) * 100;
      if (scrubProgress) scrubProgress.style.width = `${pct}%`;
      if (currentTimeDisplay) currentTimeDisplay.textContent = formatTime(video.currentTime);
      if (durationTimeDisplay) durationTimeDisplay.textContent = formatTime(video.duration);
    }
  });

  video.addEventListener('loadedmetadata', () => {
    if (durationTimeDisplay) durationTimeDisplay.textContent = formatTime(video.duration);
  });

  if (scrubTrack) {
    scrubTrack.addEventListener('click', (e) => {
      const rect = scrubTrack.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const pct = clickX / width;
      video.currentTime = pct * video.duration;
      playUiSound('click');
    });
  }

  if (muteToggle) {
    muteToggle.addEventListener('click', () => {
      video.muted = !video.muted;
      muteToggle.innerHTML = video.muted
        ? '<i class="fa-solid fa-volume-xmark"></i>'
        : '<i class="fa-solid fa-volume-high"></i>';
      playUiSound('click');
    });
  }

  if (fullscreenToggle && showreelWrapper) {
    fullscreenToggle.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        showreelWrapper.requestFullscreen().catch((err) => console.log(err));
      } else {
        document.exitFullscreen().catch((err) => console.log(err));
      }
      playUiSound('click');
    });
  }
}

/* ----------------------------------------------------------------------------
 * 6. Interactive Before / After Color Grading Slider
 * ---------------------------------------------------------------------------- */
function initColorGradingSlider() {
  const container = document.querySelector('.comparison-container');
  const layerBefore = document.getElementById('layerBefore');
  const handle = document.getElementById('sliderHandle');
  const rawImage = layerBefore ? layerBefore.querySelector('.grade-image') : null;

  if (!container || !layerBefore || !handle) return;

  function syncImageWidth() {
    if (rawImage) {
      rawImage.style.width = `${container.offsetWidth}px`;
    }
  }
  syncImageWidth();
  window.addEventListener('resize', syncImageWidth);

  let isDragging = false;

  function updateSliderPosition(clientX) {
    const rect = container.getBoundingClientRect();
    let offsetX = clientX - rect.left;

    // Clamp between 0 and container width
    if (offsetX < 0) offsetX = 0;
    if (offsetX > rect.width) offsetX = rect.width;

    const percentage = (offsetX / rect.width) * 100;
    layerBefore.style.width = `${percentage}%`;
    handle.style.left = `${percentage}%`;
  }

  // Mouse drag handlers
  handle.addEventListener('mousedown', (e) => {
    isDragging = true;
    playUiSound('click');
    e.preventDefault();
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    updateSliderPosition(e.clientX);
  });

  // Touch drag handlers
  handle.addEventListener('touchstart', (e) => {
    isDragging = true;
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isDragging = false;
  });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging || !e.touches[0]) return;
    updateSliderPosition(e.touches[0].clientX);
  }, { passive: true });

  // Direct click anywhere on the container track
  container.addEventListener('click', (e) => {
    if (e.target.closest('#sliderHandle')) return;
    updateSliderPosition(e.clientX);
    playUiSound('click');
  });
}

/* ----------------------------------------------------------------------------
 * 7. Portfolio Filtering & Case Study Modal
 * ---------------------------------------------------------------------------- */
function initPortfolioFilterAndModal() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  // Category Filtering
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      playUiSound('click');

      const filterValue = btn.getAttribute('data-filter');

      projectCards.forEach((card) => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.style.display = 'flex';
          card.style.opacity = '1';
        } else {
          card.style.display = 'none';
          card.style.opacity = '0';
        }
      });
    });
  });

  // Hover video play preview for cards
  projectCards.forEach((card) => {
    const video = card.querySelector('.project-preview-video');
    if (!video) return;

    card.addEventListener('mouseenter', () => {
      video.play().catch(() => {});
    });

    card.addEventListener('mouseleave', () => {
      video.pause();
      video.currentTime = 0;
    });
  });

  // Case Study Modal
  const modal = document.getElementById('projectModal');
  const modalClose = document.getElementById('modalClose');
  const modalVideo = document.getElementById('modalVideo');
  const modalTitle = document.getElementById('modalTitle');
  const modalClient = document.getElementById('modalClient');
  const modalViews = document.getElementById('modalViews');
  const modalRetention = document.getElementById('modalRetention');
  const modalSoftware = document.getElementById('modalSoftware');
  const modalDesc = document.getElementById('modalDesc');

  if (!modal) return;

  projectCards.forEach((card) => {
    card.addEventListener('click', () => {
      const title = card.getAttribute('data-title');
      const views = card.getAttribute('data-views');
      const retention = card.getAttribute('data-retention');
      const client = card.getAttribute('data-client');
      const software = card.getAttribute('data-software');
      const videoSrc = card.getAttribute('data-video');
      const desc = card.getAttribute('data-desc');

      if (modalTitle) modalTitle.textContent = title;
      if (modalClient) modalClient.textContent = client;
      if (modalViews) modalViews.innerHTML = `<i class="fa-solid fa-eye"></i> ${views}`;
      if (modalRetention) modalRetention.innerHTML = `<i class="fa-solid fa-chart-line"></i> ${retention}`;
      if (modalDesc) modalDesc.textContent = desc;

      if (modalSoftware && software) {
        modalSoftware.innerHTML = '';
        software.split('•').forEach((tool) => {
          const pill = document.createElement('span');
          pill.textContent = tool.trim();
          modalSoftware.appendChild(pill);
        });
      }

      if (modalVideo && videoSrc) {
        modalVideo.src = videoSrc;
        modalVideo.play().catch(() => {});
      }

      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      playUiSound('click');
    });
  });

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    if (modalVideo) {
      modalVideo.pause();
      modalVideo.src = '';
    }
    playUiSound('click');
  }

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

/* ----------------------------------------------------------------------------
 * 8. Animated Metric Counters
 * ---------------------------------------------------------------------------- */
function initMetricCounters() {
  const counters = document.querySelectorAll('.counter');
  let hasAnimated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !hasAnimated) {
        hasAnimated = true;
        counters.forEach((counter) => {
          const target = +counter.getAttribute('data-target');
          let current = 0;
          const duration = 1800; // ms
          const stepTime = 20;
          const increment = target / (duration / stepTime);

          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              counter.textContent = target;
              clearInterval(timer);
            } else {
              counter.textContent = Math.floor(current);
            }
          }, stepTime);
        });
      }
    });
  }, { threshold: 0.3 });

  const metricsStrip = document.querySelector('.hero-metrics-strip');
  if (metricsStrip) observer.observe(metricsStrip);
}

/* ----------------------------------------------------------------------------
 * 9. Navbar Scrolled & Active Link ScrollSpy
 * ---------------------------------------------------------------------------- */
function initNavbarAndScrollSpy() {
  const navbar = document.getElementById('navbar');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // ScrollSpy active link detection
    let currentId = '';
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentId = section.getAttribute('id');
      }
    });

    if (currentId) {
      navLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentId}`) {
          link.classList.add('active');
        }
      });
    }
  });

  // Mobile drawer toggle
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileDrawer.classList.toggle('active');
      playUiSound('click');
    });

    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('active');
      });
    });
  }
}

/* ----------------------------------------------------------------------------
 * 10. Contact Form Submission
 * ---------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const formStatus = document.getElementById('formStatus');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Transmitting Commission Brief...</span>';
    playUiSound('click');

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;

      formStatus.className = 'form-status success';
      formStatus.innerHTML = '<i class="fa-solid fa-circle-check"></i> Commission dispatched successfully! VK will review your footage and respond within 24 hours.';

      form.reset();
      playUiSound('activate');

      setTimeout(() => {
        formStatus.style.display = 'none';
      }, 7000);
    }, 1500);
  });
}
