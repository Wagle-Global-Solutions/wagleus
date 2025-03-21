document.addEventListener('DOMContentLoaded', function() {
    const itemsPerPage = 6;
    const toolsGrid = document.getElementById('toolsGrid');
    const toolSearch = document.getElementById('toolSearch');
    const pagination = document.getElementById('toolsPagination');
    
    let currentPage = 1;
    let filteredTools = [...toolsGrid.children];

    function filterTools() {
        const searchTerm = toolSearch.value.toLowerCase().trim();

        filteredTools = [...toolsGrid.children].filter(tool => {
            const cardBody = tool.querySelector('.card-body');
            const title = cardBody.querySelector('h3').textContent.toLowerCase();
            const features = Array.from(cardBody.querySelectorAll('ul li'))
                .map(li => li.textContent.toLowerCase())
                .join(' ');
            const description = cardBody.querySelector('.demo-box')?.textContent.toLowerCase() || '';
            
            const searchText = `${title} ${features} ${description}`;
            return searchText.includes(searchTerm);
        });

        currentPage = 1;
        updatePagination();
        displayTools();
        
        // Show/hide no results message
        const noResults = document.getElementById('noResults') || createNoResultsElement();
        if (filteredTools.length === 0 && searchTerm !== '') {
            noResults.style.display = 'block';
        } else {
            noResults.style.display = 'none';
        }
    }

    function createNoResultsElement() {
        const noResults = document.createElement('div');
        noResults.id = 'noResults';
        noResults.className = 'alert alert-info text-center';
        noResults.innerHTML = 'No tools found matching your search.';
        toolsGrid.parentNode.insertBefore(noResults, toolsGrid.nextSibling);
        return noResults;
    }

    function updatePagination() {
        const pageCount = Math.ceil(filteredTools.length / itemsPerPage);
        pagination.innerHTML = '';

        if (pageCount <= 1) return;

        // Previous button
        pagination.innerHTML += `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>
            </li>
        `;

        // Page numbers
        for (let i = 1; i <= pageCount; i++) {
            pagination.innerHTML += `
                <li class="page-item ${currentPage === i ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }

        // Next button
        pagination.innerHTML += `
            <li class="page-item ${currentPage === pageCount ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>
            </li>
        `;
    }

    function displayTools() {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        
        [...toolsGrid.children].forEach(tool => tool.style.display = 'none');
        filteredTools.slice(start, end).forEach(tool => tool.style.display = '');
    }

    // Add debounce to search for better performance
    let searchTimeout;
    toolSearch.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(filterTools, 300);
    });

    pagination.addEventListener('click', (e) => {
        e.preventDefault();
        if (e.target.classList.contains('page-link')) {
            currentPage = parseInt(e.target.dataset.page);
            updatePagination();
            displayTools();
            // Remove the window.scrollTo call to prevent scrolling
        }
    });

    // Initial setup
    updatePagination();
    displayTools();
});
