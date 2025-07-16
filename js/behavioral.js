// Behavioral tab logic

export function renderBehavioralTab(tab) {
  // Visible placeholder content
  return `<section id="tab-behavioral" class="tab-content">
    <h3 class="text-xl font-semibold mb-4 flex items-center"><i class="bi bi-person-lines-fill mr-2"></i> ${tab.name} (Visible)</h3>
    <div id="behavioral-card-wrap">Behavioral tab content goes here.</div>
  </section>`;
}
