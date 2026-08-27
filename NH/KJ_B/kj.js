document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('#menu-toggle');
  const siteMenu = document.querySelector('#site-menu');
  const toast = document.querySelector('#toast');
  let toastTimer;

  const closeMenu = () => {
    if (!menuToggle || !siteMenu) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', '메뉴 열기');
    siteMenu.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  };

  const openMenu = () => {
    if (!menuToggle || !siteMenu) return;
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', '메뉴 닫기');
    siteMenu.classList.add('is-open');
    document.body.classList.add('menu-open');
  };

  menuToggle?.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  });
  siteMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
      menuToggle?.focus();
    }
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) closeMenu();
  });

  const processData = {
    1: {
      tag: 'INPUT · PHYSICAL SEPARATION',
      title: '원자재 투입 & 물리적 피복 박리',
      copy: '폐광케이블, 젤리케이블, 자동차 인서트 사출 불량품을 투입합니다. 화학 용해나 고온 열처리 없이 기계적 물리력으로 외피와 금속을 안전하게 분리합니다.',
      input: '폐광·젤리케이블, 복합 폐기물',
      output: '박리된 금속·피복 혼합 입자'
    },
    2: {
      tag: 'AIR · FLUID DYNAMICS',
      title: '유체역학 에어 정밀 선별',
      copy: '입자별 밀도와 비중 차이를 계산한 공기 흐름으로 젤리 유분, 금속, 플라스틱을 정밀하게 가릅니다. 세척수와 화학 용제가 필요하지 않습니다.',
      input: '박리된 금속·피복 혼합 입자',
      output: '유분이 제거된 금속·플라스틱 입자'
    },
    3: {
      tag: 'COPPER · HIGH PURITY',
      title: '99%+ 고순도 구리 회수',
      copy: '유분과 이물질이 분리된 금속 입자를 정밀 선별해 원자재급 구리로 회수합니다. 소각 과정이 없어 열손실을 줄이고 구리의 가치를 보존합니다.',
      input: '정밀 에어 선별 금속 입자',
      output: '99%+ 고순도 구리 원료'
    },
    4: {
      tag: 'POLYMER · MATERIAL RETURN',
      title: '고순도 HDPE 고분자 수지 회수',
      copy: '케이블 피복의 HDPE를 열 손상 없이 분리해 재생 플라스틱 원료로 전환합니다. 금속뿐 아니라 플라스틱까지 순환시키는 완결형 공정입니다.',
      input: '선별된 고분자 플라스틱 입자',
      output: '고순도 재생 HDPE 원자재'
    }
  };

  const processPanel = document.querySelector('#process-panel');
  const processTabs = [...document.querySelectorAll('.process-tab')];
  const selectProcess = (step) => {
    const data = processData[step];
    if (!data || !processPanel) return;
    processTabs.forEach((tab) => {
      const active = tab.dataset.step === String(step);
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.setAttribute('tabindex', active ? '0' : '-1');
    });
    processPanel.setAttribute('aria-labelledby', `process-tab-${step}`);
    processPanel.querySelector('[data-process-index]').textContent = String(step).padStart(2, '0');
    processPanel.querySelector('[data-process-tag]').textContent = data.tag;
    processPanel.querySelector('[data-process-title]').textContent = data.title;
    processPanel.querySelector('[data-process-copy]').textContent = data.copy;
    processPanel.querySelector('[data-process-input]').textContent = data.input;
    processPanel.querySelector('[data-process-output]').textContent = data.output;
  };

  processTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectProcess(Number(tab.dataset.step)));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(event.key)) return;
      event.preventDefault();
      const direction = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1;
      const next = (index + direction + processTabs.length) % processTabs.length;
      processTabs[next].focus();
      selectProcess(Number(processTabs[next].dataset.step));
    });
  });

  const showToast = (message) => {
    if (!toast) return;
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('is-visible');
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2600);
  };

  document.querySelectorAll('[data-copy]').forEach((button) => {
    button.addEventListener('click', async () => {
      const value = button.dataset.copy;
      const label = button.dataset.copyLabel || '정보';
      try {
        await navigator.clipboard.writeText(value);
        showToast(`${label}가 복사되었습니다.`);
      } catch {
        const textarea = document.createElement('textarea');
        textarea.value = value;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const copied = document.execCommand('copy');
        textarea.remove();
        showToast(copied ? `${label}가 복사되었습니다.` : `${label}: ${value}`);
      }
    });
  });

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealItems = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px' });
    revealItems.forEach((item) => observer.observe(item));
  }

  const currentYear = document.querySelector('#current-year');
  if (currentYear) currentYear.textContent = String(new Date().getFullYear());
});
