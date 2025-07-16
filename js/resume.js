// Resume tab logic

export function renderResumeTab(tab) {
  // Visible placeholder content
  return `<section id="tab-resume" class="tab-content">
    <h3 class="text-xl font-semibold mb-4 flex items-center"><i class="bi bi-file-earmark-person mr-2"></i> ${tab.name} (Visible)</h3>
    <div>Resume tab content goes here.</div>
  </section>`;
}
