(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const ns = 'http://www.w3.org/2000/svg';
  document.querySelectorAll('[data-vascular-scene]').forEach(scene => {
    const svg = scene.querySelector('svg');
    const world = scene.querySelector('[data-vascular-world]');
    const pause = scene.querySelector('[data-vascular-pause]');
    const descriptions = {
      sensing: 'A symbolic ultrasound beam explores blood flow near the instrument tip.',
      aspiration: 'Particles illustrate aspiration through the adjacent instrument channel.',
      combined: 'Vascular awareness and surgical function, together at the point of action.'
    };
    let time = 0, last = 0, raf = 0, inView = false, paused = false;
    let pointer = { x: 0, y: 0 }, current = { x: 0, y: 0 };
    const make = (name, attrs, parent) => {
      const element = document.createElementNS(ns, name);
      for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, value);
      parent.append(element);
      return element;
    };
    // Cache the geometry once; animation only updates small particle transforms.
    const blood = [...svg.querySelectorAll('defs path')].flatMap((path, branch) => {
      const length = path.getTotalLength();
      const points = Array.from({ length: 180 }, (_, i) => path.getPointAtLength(length * i / 179));
      return Array.from({ length: branch === 0 ? 25 : 12 }, (_, i) => ({
        element: make('ellipse', { rx: branch === 0 ? 3 : 2, ry: 1.5, opacity: .65 }, scene.querySelector('[data-blood-particles]')),
        points, offset: (i * .6180339887) % 1, speed: .045 + branch * .008,
        spread: Math.sin(i * 17.1) * (branch === 0 ? 10 : 4)
      }));
    });
    const waves = Array.from({ length: 5 }, (_, i) => ({
      element: make('path', { d: 'M0 -1Q1 0 0 1' }, scene.querySelector('[data-ultrasound-waves]')), offset: i / 5
    }));
    const aspiration = Array.from({ length: 23 }, (_, i) => ({
      element: make('circle', { r: 1.2 + i % 3 * .4 }, scene.querySelector('[data-aspiration-particles]')),
      offset: i / 23, spread: Math.sin(i * 31) * 48
    }));
    function draw() {
      current.x += (pointer.x - current.x) * .07;
      current.y += (pointer.y - current.y) * .07;
      world.setAttribute('transform', `translate(${current.x.toFixed(2)} ${current.y.toFixed(2)})`);
      blood.forEach(({ element, points, offset, speed, spread }) => {
        const p = points[Math.floor(((time * speed + offset) % 1) * 179)];
        element.setAttribute('transform', `translate(${p.x.toFixed(1)} ${(p.y + spread).toFixed(1)}) rotate(-32)`);
      });
      waves.forEach(({ element, offset }) => {
        const phase = (time * .48 + offset) % 1;
        const x = 9 + phase * 155, width = 5 + phase * 59;
        element.setAttribute('d', `M${x} ${-width}Q${x + width * .5} 0 ${x} ${width}`);
        element.setAttribute('opacity', ((1 - phase) * .8).toFixed(2));
      });
      aspiration.forEach(({ element, offset, spread }) => {
        const phase = (time * .26 + offset) % 1, remain = 1 - phase;
        const x = 365 - 105 * remain;
        const y = 258 + 123 * remain + spread * remain * Math.sin(phase * Math.PI);
        element.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
        element.setAttribute('opacity', (Math.sin(phase * Math.PI) * .8).toFixed(2));
      });
    }
    const stopped = () => paused || reduced.matches || document.documentElement.classList.contains('motion-paused');
    function animate(now) {
      raf = 0;
      time += last ? Math.min((now - last) / 1000, .05) : 0;
      last = now; draw();
      if (!stopped() && inView && !document.hidden) raf = requestAnimationFrame(animate);
    }
    function sync() {
      cancelAnimationFrame(raf); raf = 0; last = 0;
      const frozen = stopped();
      scene.dataset.paused = String(frozen);
      pause.setAttribute('aria-pressed', String(frozen));
      pause.setAttribute('aria-label', reduced.matches ? 'Vessel animation respects reduced motion' : frozen ? 'Play vessel animation' : 'Pause vessel animation');
      pause.querySelector('span').textContent = frozen ? '▷' : 'Ⅱ';
      pause.disabled = reduced.matches || document.documentElement.classList.contains('motion-paused');
      if (frozen) { pointer = { x: 0, y: 0 }; current = { x: 0, y: 0 }; }
      draw();
      if (!frozen && inView && !document.hidden) raf = requestAnimationFrame(animate);
    }
    scene.querySelectorAll('[data-vascular-mode]').forEach(button => button.addEventListener('click', () => {
      scene.dataset.mode = button.dataset.vascularMode;
      scene.querySelectorAll('[data-vascular-mode]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      scene.querySelector('[data-vascular-caption]').textContent = descriptions[button.dataset.vascularMode];
    }));
    pause.addEventListener('click', () => { paused = !paused; sync(); });
    scene.querySelector('.vascular-stage').addEventListener('pointermove', event => {
      if (stopped() || event.pointerType === 'touch') return;
      const rect = svg.getBoundingClientRect();
      pointer = { x: ((event.clientX - rect.left) / rect.width - .5) * 15, y: ((event.clientY - rect.top) / rect.height - .5) * 15 };
    });
    scene.addEventListener('pointerleave', () => { pointer = { x: 0, y: 0 }; });
    new IntersectionObserver(entries => { inView = entries[0].isIntersecting; sync(); }, { threshold: .01 }).observe(scene);
    new MutationObserver(sync).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    document.addEventListener('visibilitychange', sync);
    reduced.addEventListener('change', sync);
    sync();
  });
})();
