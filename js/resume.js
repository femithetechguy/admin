// Resume tab logic


export function renderResumeTab(tab) {
  // Fetch folder and default resume links from resume.json and show as styled buttons
  setTimeout(() => {
    fetch('json/resume.json')
      .then(res => res.json())
      .then(data => {
        const folderUrl = data?.resume?.folder_path;
        const defaultResumeUrl = data?.resume?.default_resume_path;
        const container = document.getElementById('resume-folder-container');
        if (!container) return;
        let html = '';
        if (folderUrl) {
          html += `<a href="${folderUrl}" target="_blank" rel="noopener" class="inline-flex items-center px-5 py-2 mb-3 mr-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow transition focus:outline-none focus:ring-2 focus:ring-blue-400"><i class="bi bi-folder2-open mr-2"></i>Resume Folder</a>`;
        }
        if (defaultResumeUrl) {
          html += `<a href="${defaultResumeUrl}" target="_blank" rel="noopener" class="inline-flex items-center px-5 py-2 mb-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded shadow transition focus:outline-none focus:ring-2 focus:ring-green-400"><i class="bi bi-file-earmark-person mr-2"></i>Default Resume</a>`;
        }
        if (!folderUrl && !defaultResumeUrl) {
          html = '<div class="text-red-500">No resume links found.</div>';
        }
        let afterLine = '';
        // If defaultResumeUrl is a Google Drive file, try to embed as PDF
        if (defaultResumeUrl) {
          // Extract file ID from Google Drive link
          const match = defaultResumeUrl.match(/\/d\/([\w-]+)/);
          if (match && match[1]) {
            const fileId = match[1];
            const pdfUrl = `https://drive.google.com/file/d/${fileId}/preview`;
            afterLine = `<div class="w-full flex flex-col items-center justify-center"><iframe src="${pdfUrl}" style="width:100%; min-height:600px; border:1px solid #ddd; border-radius:8px; background:#fafbfc;" allow="autoplay"></iframe></div>`;
          } else {
            // If not a Google Drive file, show a message
            afterLine = `<div class="text-gray-500 text-center mt-4">Cannot preview this file type here.</div>`;
          }
        }
        container.innerHTML = `<div class="flex flex-col sm:flex-row items-center justify-center gap-4">${html}</div><hr class="my-6 w-full border-t border-gray-300">${afterLine}`;
      })
      .catch(() => {
        const container = document.getElementById('resume-folder-container');
        if (container) container.innerHTML = `<div class="text-red-500">Failed to load resume links.</div>`;
      });
  }, 0);

  return `<section id="tab-resume" class="tab-content">
    <h3 class="text-xl font-semibold mb-4 flex items-center"><i class="bi bi-file-earmark-person mr-2"></i> ${tab.name}</h3>
    <div id="resume-folder-container" class="w-full flex flex-col items-center justify-center min-h-[120px]">
      <div class="text-gray-400 animate-pulse">Loading resume links...</div>
    </div>
  </section>`;
}
