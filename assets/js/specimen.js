/* ============================================================
   Specimen axis control — binds the hero slider to the live
   font-variation-settings of the specimen headline.
   ============================================================ */

function initAxisSpecimen() {
  const slider = document.getElementById('axisSlider');
  const display = document.getElementById('specimenDisplay');
  const readout = document.getElementById('axisReadout');
  if (!slider || !display) return;

  const WGHT_MIN = 300, WGHT_MAX = 1000;
  const CASL_MAX = 1, CASL_MIN = 0; // 1 = casual (draft), 0 = formal (production)

  function update(val) {
    const t = val / 100;
    const wght = Math.round(WGHT_MIN + (WGHT_MAX - WGHT_MIN) * t);
    const casl = (CASL_MAX + (CASL_MIN - CASL_MAX) * t).toFixed(2);
    display.style.setProperty('--axis-wght', wght);
    display.style.setProperty('--axis-casl', casl);
    if (readout) readout.textContent = `WGHT ${wght} · CASL ${casl}`;
  }

  slider.addEventListener('input', (e) => update(Number(e.target.value)));
  update(Number(slider.value));
}

document.addEventListener('DOMContentLoaded', initAxisSpecimen);
