
// School tab renderer: embeds the local school portal in an iframe with no vertical scrollbar
window.renderSchoolTab = function() {
  return `
    <div class="w-full h-full flex flex-col" style="height: 100vh; min-height: 0;">
      <iframe 
        src="https://school.kolawoles.com/"
        class="flex-1 w-full"
        style="border:0; height:100%; width:100%; min-height:0; display:block;"
        allowfullscreen 
        loading="lazy"
      ></iframe>
    </div>
  `;
};

