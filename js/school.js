// School tab renderer: embeds the school portal responsively
window.renderSchoolTab = function() {
  return `
    <div class="w-full h-full">
      <div class="w-full max-w-6xl mx-auto my-4">
        <div class="text-xl font-bold mb-4 flex items-center gap-2"><i class="bi bi-mortarboard"></i> School Portal</div>
        <div class="rounded-lg overflow-hidden border border-gray-200 shadow bg-white" style="min-height:90vh;">
          <iframe src="https://school.kolawoles.com/" class="w-full min-h-[90vh] h-[90vh] md:h-[90vh]" style="border:0;" allowfullscreen loading="lazy"></iframe>
        </div>
      </div>
    </div>
  `;
};
