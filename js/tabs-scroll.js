/* This script ensures more navigation items are visible by scrolling the tabs menu */
document.addEventListener('DOMContentLoaded', function() {
  // Function to scroll to the active tab or ensure more tabs are visible
  function scrollTabsToVisiblePosition() {
    setTimeout(function() {
      const tabsMenu = document.getElementById('tabs-menu');
      if (!tabsMenu) return;
      
      // First try to scroll to the active tab
      const activeTab = tabsMenu.querySelector('.tab-btn.bg-blue-100');
      if (activeTab) {
        const tabPos = activeTab.offsetLeft;
        const menuWidth = tabsMenu.clientWidth;
        
        // Start at the beginning to show more tabs
        if (tabPos < 300) {
          tabsMenu.scrollLeft = 0;
        } else {
          // Center the active tab
          tabsMenu.scrollLeft = tabPos - (menuWidth / 2) + (activeTab.clientWidth / 2);
        }
        return;
      }
      
      // If no active tab, ensure the beginning tabs are visible
      tabsMenu.scrollLeft = 0;
    }, 100);
  }
  
  // Function to ensure a specific tab is visible
  function ensureTabVisible(tabName) {
    const tabsMenu = document.getElementById('tabs-menu');
    if (!tabsMenu) return;
    
    const allTabs = Array.from(tabsMenu.querySelectorAll('.tab-btn'));
    const targetTab = allTabs.find(tab => tab.textContent.includes(tabName));
    
    if (targetTab) {
      const tabPos = targetTab.offsetLeft;
      // Position the tab closer to the beginning of the visible area
      tabsMenu.scrollLeft = Math.max(0, tabPos - 50);
    }
  }
  
  // Call on initial load
  scrollTabsToVisiblePosition();
  
  // Add button to scroll left
  setTimeout(function() {
    const nav = document.querySelector('nav .container');
    if (nav) {
      const scrollLeftBtn = document.createElement('button');
      scrollLeftBtn.className = 'scroll-left-btn sm:block hidden absolute left-[115px] top-1/2 transform -translate-y-1/2 bg-white rounded-full shadow-md p-1';
      scrollLeftBtn.innerHTML = '<i class="bi bi-chevron-left text-blue-500"></i>';
      scrollLeftBtn.title = 'Scroll tabs left';
      scrollLeftBtn.onclick = function() {
        const tabsMenu = document.getElementById('tabs-menu');
        if (tabsMenu) {
          tabsMenu.scrollLeft -= 150; // Scroll more
        }
      };
      nav.appendChild(scrollLeftBtn);
      
      const scrollRightBtn = document.createElement('button');
      scrollRightBtn.className = 'scroll-right-btn sm:block hidden absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full shadow-md p-1';
      scrollRightBtn.innerHTML = '<i class="bi bi-chevron-right text-blue-500"></i>';
      scrollRightBtn.title = 'Scroll tabs right';
      scrollRightBtn.onclick = function() {
        const tabsMenu = document.getElementById('tabs-menu');
        if (tabsMenu) {
          tabsMenu.scrollLeft += 150; // Scroll more
        }
      };
      nav.appendChild(scrollRightBtn);
    }
  }, 200);
  
  // Also call when window is resized
  window.addEventListener('resize', scrollTabsToVisiblePosition);
  
  // Monitor for tab changes
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        scrollTabsToVisiblePosition();
      }
    });
  });
  
  // Set up the observer to monitor tab button class changes
  setTimeout(function() {
    const tabsMenu = document.getElementById('tabs-menu');
    if (tabsMenu) {
      const tabButtons = tabsMenu.querySelectorAll('.tab-btn');
      tabButtons.forEach(function(button) {
        observer.observe(button, { attributes: true });
      });
    }
  }, 200);
});
