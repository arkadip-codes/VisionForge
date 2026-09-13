// Safety Lessons Screen: 4 Interactive Modules with Knowledge Checks

import { speak, playSuccessChime, playPenaltyBuzz } from '../voice.js';

const LESSON_MODULES = [
  {
    id: "mod_01",
    title: "Module 1: Recognizing Mine Fire & Heating",
    duration: "4 mins",
    summary: "Identify spontaneous combustion indicators: subtle haze, kerosene-like odor, elevated Carbon Monoxide (CO), and hot idler rollers.",
    keyPoints: [
      "Coal fines absorb atmospheric oxygen exothermic reaction.",
      "First olfactory indication: 'Fire stink' (petroleum / sweet paraffin smell).",
      "DGMS CMR Regulation 136 mandates continuous CO monitoring."
    ],
    question: "What is the earliest sensory indicator of spontaneous coal combustion underground?",
    options: [
      { text: "Roaring open flames on the belt", correct: false, reason: "By the time open flames appear, combustion is dangerously advanced." },
      { text: "Sweet paraffin-like 'fire stink' odor & localized haze", correct: true, reason: "Correct! The low-temperature oxidation of coal volatiles emits a distinct paraffin odor first." },
      { text: "Sudden roof collapse", correct: false, reason: "Roof collapse is a geomechanical hazard, not an early fire sign." }
    ]
  },
  {
    id: "mod_02",
    title: "Module 2: Fire Extinguisher Selection",
    duration: "5 mins",
    summary: "Select correct media for electrical conveyor drives and coal dust without causing dust dispersion or electrical shock.",
    keyPoints: [
      "Use Dry Chemical Powder (DCP - Sodium/Potassium Bicarbonate) on conveyor belts.",
      "Never direct high-pressure solid water streams directly onto dry coal dust (dust explosion risk).",
      "Turn off electrical power supply before applying media."
    ],
    question: "Why should water jets NOT be directed directly onto dry coal dust piles during fire response?",
    options: [
      { text: "Water causes coal to turn into diamond", correct: false, reason: "Nonsensical chemical reaction." },
      { text: "It violently aerates fine dust into suspension, risking an explosive dust cloud", correct: true, reason: "Correct! High-pressure water throws fine dust (<75 microns) into air, creating an explosive cloud." },
      { text: "Water is banned by DGMS for all uses", correct: false, reason: "Water is used for wetting roadways and sprays, but not high-pressure jets on loose dust." }
    ]
  },
  {
    id: "mod_03",
    title: "Module 3: PASS Standard Operating Procedure",
    duration: "5 mins",
    summary: "The 4-step emergency sequence to discharge an industrial dry chemical powder cylinder.",
    keyPoints: [
      "P - Pull the safety lock pin and break plastic seal.",
      "A - Aim the discharge horn at the BASE of the fire, not the flames.",
      "S - Squeeze the operating lever smoothly.",
      "S - Sweep the nozzle from side-to-side across the burning zone."
    ],
    question: "Where should the extinguisher nozzle be targeted during discharge?",
    options: [
      { text: "At the top of the smoke plume", correct: false, reason: "Discharging into smoke wastes powder into the ventilation current." },
      { text: "At the very base of the burning fuel", correct: true, reason: "Correct! Smothering the fuel base cuts off oxygen and cools the combustion layer." },
      { text: "Upwards at the mine roof bolts", correct: false, reason: "This will not suppress the burning material on the floor or belt." }
    ]
  },
  {
    id: "mod_04",
    title: "Module 4: Ventilation & Safe Positioning",
    duration: "4 mins",
    summary: "Understand mine ventilation dynamics: Intake airway (fresh) vs Return airway (contaminated).",
    keyPoints: [
      "Always approach fires with fresh intake ventilation at your back.",
      "Never advance from the return airway (downwind) where Carbon Monoxide accumulates.",
      "Carbon monoxide at 0.1% (1000 ppm) causes unconsciousness in 30 minutes."
    ],
    question: "If a fire occurs in a trunk conveyor gallery, where MUST the firefighting team position themselves?",
    options: [
      { text: "In the Return Airway downwind of the smoke", correct: false, reason: "Fatal mistake: Return air contains lethal Carbon Monoxide (CO)." },
      { text: "In the Intake Airway with fresh air traveling past them toward the fire", correct: true, reason: "Correct! The intake airflow blows smoke, heat, and toxic gases away from the workers." },
      { text: "Directly underneath the burning belt drive", correct: false, reason: "Falling burning rubber creates extreme burn and entrapment hazards." }
    ]
  }
];

export function renderLessonsScreen(container, state) {
  let activeModuleIndex = 0;

  function renderView() {
    const mod = LESSON_MODULES[activeModuleIndex];

    container.innerHTML = `
      <div style="padding-top: 8px;">
        <!-- Header & Back Navigation -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <button id="btn-lessons-back" class="btn-secondary" style="padding: 6px 12px; border-radius: var(--radius-full);">
              ← Back
            </button>
            <h2 style="font-size: 18px; font-weight: 800; color: var(--text-primary);">Safety Lessons</h2>
          </div>
          <span style="font-size: 12px; font-weight: 700; color: #0284c7; background: #e0f2fe; padding: 4px 10px; border-radius: var(--radius-full);">
            ${activeModuleIndex + 1} of ${LESSON_MODULES.length}
          </span>
        </div>

        <!-- Module Selector Tabs -->
        <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 10px; margin-bottom: 16px; scrollbar-width: none;">
          ${LESSON_MODULES.map((m, idx) => `
            <button class="btn-util ${idx === activeModuleIndex ? 'btn-demo-mode' : ''}" data-mod-idx="${idx}" style="flex-shrink: 0; padding: 6px 12px;">
              Mod ${idx + 1}
            </button>
          `).join('')}
        </div>

        <!-- Lesson Card -->
        <div style="background: #ffffff; border-radius: var(--radius-xl); padding: 20px; border: 1px solid #e2e8f0; box-shadow: var(--shadow-sm); margin-bottom: 20px;">
          <span style="background: #e0f2fe; color: #0369a1; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: var(--radius-full);">
            ⏱ ${mod.duration} READ
          </span>
          <h3 style="font-size: 17px; font-weight: 800; color: var(--text-primary); margin: 10px 0 8px 0;">
            ${mod.title}
          </h3>
          <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.55; margin-bottom: 16px;">
            ${mod.summary}
          </p>

          <div style="background: #f8fafc; border-radius: var(--radius-md); padding: 14px; margin-bottom: 20px; border-left: 4px solid #1b3a5b;">
            <h4 style="font-size: 12px; font-weight: 700; color: #1b3a5b; text-transform: uppercase; margin-bottom: 8px;">
              Statutory Key Principles:
            </h4>
            <ul style="font-size: 12.5px; color: #334155; padding-left: 18px; line-height: 1.6;">
              ${mod.keyPoints.map(pt => `<li>${pt}</li>`).join('')}
            </ul>
          </div>

          <!-- Interactive Knowledge Check -->
          <div style="border-top: 1px solid #e2e8f0; padding-top: 16px;">
            <h4 style="font-size: 13px; font-weight: 800; color: #d97706; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
              <span>❓</span> Knowledge Check (+10 XP)
            </h4>
            <p style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 12px;">
              ${mod.question}
            </p>

            <div style="display: flex; flex-direction: column; gap: 8px;" id="options-container">
              ${mod.options.map((opt, oIdx) => `
                <button class="deck-btn" data-opt-idx="${oIdx}" style="text-align: left; padding: 12px; font-size: 12.5px; color: #1e293b; background: #f8fafc; border: 1px solid #cbd5e1;">
                  ${opt.text}
                </button>
              `).join('')}
            </div>

            <div id="quiz-feedback" style="display: none; margin-top: 14px; padding: 12px; border-radius: var(--radius-md); font-size: 12.5px;"></div>
          </div>
        </div>

        <!-- Next / Previous Controls -->
        <div style="display: flex; justify-content: space-between; gap: 12px; margin-bottom: 24px;">
          <button id="btn-prev-mod" class="btn-secondary" style="flex: 1;" ${activeModuleIndex === 0 ? 'disabled' : ''}>
            ← Previous
          </button>
          <button id="btn-next-mod" class="btn-primary" style="flex: 1;" ${activeModuleIndex === LESSON_MODULES.length - 1 ? 'disabled' : ''}>
            Next Module →
          </button>
        </div>
      </div>
    `;

    // Bind navigation
    container.querySelector('#btn-lessons-back')?.addEventListener('click', () => {
      window.location.hash = '#home';
    });

    container.querySelectorAll('[data-mod-idx]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeModuleIndex = parseInt(btn.getAttribute('data-mod-idx'));
        renderView();
      });
    });

    container.querySelector('#btn-prev-mod')?.addEventListener('click', () => {
      if (activeModuleIndex > 0) {
        activeModuleIndex--;
        renderView();
      }
    });

    container.querySelector('#btn-next-mod')?.addEventListener('click', () => {
      if (activeModuleIndex < LESSON_MODULES.length - 1) {
        activeModuleIndex++;
        renderView();
      }
    });

    // Bind Quiz Options
    const fbBox = container.querySelector('#quiz-feedback');
    container.querySelectorAll('[data-opt-idx]').forEach(btn => {
      btn.addEventListener('click', () => {
        const oIdx = parseInt(btn.getAttribute('data-opt-idx'));
        const opt = mod.options[oIdx];

        container.querySelectorAll('[data-opt-idx]').forEach(b => b.disabled = true);

        fbBox.style.display = 'block';
        if (opt.correct) {
          btn.style.borderColor = '#10b981';
          btn.style.background = '#d1fae5';
          fbBox.style.background = '#d1fae5';
          fbBox.style.color = '#065f46';
          fbBox.innerHTML = `<strong>✓ Correct! (+10 XP)</strong><br>${opt.reason}`;
          playSuccessChime();
          speak("Correct response. 10 XP awarded.");
          if (state.worker) state.worker.xp += 10;
        } else {
          btn.style.borderColor = '#ef4444';
          btn.style.background = '#fee2e2';
          fbBox.style.background = '#fee2e2';
          fbBox.style.color = '#991b1b';
          fbBox.innerHTML = `<strong>✗ Incorrect</strong><br>${opt.reason}`;
          playPenaltyBuzz();
          speak("Incorrect answer. Review the safety doctrine.");
        }
      });
    });
  }

  renderView();
}
