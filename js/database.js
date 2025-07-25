// License order configuration (from most free to least free)
const licenseOrder = [
    'CC0', 'CC', 'CC-BY', 'MIT', 'GPL', 'Modified-BSD', 
    'Apache', 'Unsplash', 'Pixabay', 'Custom', 'Mixed'
];

// Global state
let items = [];
let filteredItems = [];
let currentPage = 1;
const itemsPerPage = 50;
let sortColumn = 'License';
let sortDirection = 'asc';

// Cached DOM elements
const elements = {
    categoryFilter: document.getElementById('filter-category'),
    licenseFilter: document.getElementById('filter-license'),
    tagsFilter: document.getElementById('filter-tags'),
    nameFilter: document.getElementById('filter-name'),
    itemGrid: document.getElementById('item-grid'),
    prevPageBtn: document.getElementById('prev-page'),
    nextPageBtn: document.getElementById('next-page'),
    pageInfo: document.getElementById('page-info'),
    loading: document.getElementById('loading'),
    noResults: document.getElementById('no-results')
};

// Utility functions
const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
};

const getCategoryIcon = (category) => {
    const icons = { 'tools': '🔧', 'libraries': '📚' };
    return icons[category.toLowerCase()] || '❓';
};

const getLicenseOrder = (license) => {
    const index = licenseOrder.indexOf(license);
    return index === -1 ? Infinity : index;
};

// CSV parsing
function parseCsvLine(line) {
    const parts = [];
    let currentPart = '';
    let inQuotes = false;
    
    for (let char of line) {
        if (char === '"' && !inQuotes) {
            inQuotes = true;
        } else if (char === '"' && inQuotes) {
            inQuotes = false;
        } else if (char === ',' && !inQuotes) {
            parts.push(currentPart.trim());
            currentPart = '';
        } else {
            currentPart += char;
        }
    }
    parts.push(currentPart.trim());
    return parts;
}

function loadCsvData(csvString) {
    const lines = csvString.split('\n').filter(line => line.trim());
    const parsedItems = [];
    
    lines.forEach((line, index) => {
        const parts = parseCsvLine(line);
        
        // Skip header or invalid rows
        if (parts.length < 5 || (index === 0 && parts[0].toLowerCase().includes('name'))) {
            return;
        }
        
        const [name, link, category, license, tagsStr] = parts;
        if (!name) return;
        
        const tags = tagsStr ? tagsStr.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
        
        parsedItems.push({
            Name: name,
            Link: link,
            Category: category || '',
            License: license || '',
            Tags: tags,
            TagsLower: tags.map(t => t.toLowerCase())
        });
    });
    
    return parsedItems;
}

// Data loading
async function loadData() {
    try {
        elements.loading.style.display = 'block';
        const response = await fetch('data.csv');
        if (!response.ok) throw new Error(`Failed to load CSV: ${response.statusText}`);
        
        const csvString = await response.text();
        items = loadCsvData(csvString);
        
        populateFilters();
        applyFiltersAndSort();
        elements.loading.style.display = 'none';
        
        console.log('Loaded items:', items.length);
    } catch (error) {
        console.error('Error loading CSV:', error);
        elements.loading.innerText = 'Error loading data.';
    }
}

// Filter population
function populateFilters() {
    const categories = [...new Set(items.map(item => item.Category).filter(cat => cat))].sort();
    const licenses = [...new Set(items.map(item => item.License).filter(lic => lic))]
        .sort((a, b) => getLicenseOrder(a) - getLicenseOrder(b));
    
    elements.categoryFilter.innerHTML = '<option value="">All Categories</option>' + 
        categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
    
    elements.licenseFilter.innerHTML = '<option value="">All Licenses</option>' + 
        licenses.map(lic => `<option value="${lic}">${lic}</option>`).join('');
}

// Filtering and sorting
function applyFilters() {
    const filters = {
        category: elements.categoryFilter.value.toLowerCase(),
        license: elements.licenseFilter.value.toLowerCase(),
        name: elements.nameFilter.value.toLowerCase(),
        tags: elements.tagsFilter.value.toLowerCase()
            .split(/[,\s]+/)
            .map(tag => tag.trim())
            .filter(tag => tag)
    };
    
    filteredItems = items.filter(item => {
        // Category filter
        if (filters.category && item.Category.toLowerCase() !== filters.category) {
            return false;
        }
        
        // License filter
        if (filters.license && item.License.toLowerCase() !== filters.license) {
            return false;
        }
        
        // Name filter
        if (filters.name && !item.Name.toLowerCase().includes(filters.name)) {
            return false;
        }
        
        // Tags filter (all tags must match)
        if (filters.tags.length > 0) {
            return filters.tags.every(filterTag => 
                item.TagsLower.some(itemTag => itemTag.includes(filterTag))
            );
        }
        
        return true;
    });
}

function sortItems() {
    filteredItems.sort((a, b) => {
        let valA, valB;
        
        if (sortColumn === 'License') {
            valA = getLicenseOrder(a[sortColumn]);
            valB = getLicenseOrder(b[sortColumn]);
        } else {
            valA = (a[sortColumn] || '').toLowerCase();
            valB = (b[sortColumn] || '').toLowerCase();
        }
        
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
}

function applyFiltersAndSort() {
    applyFilters();
    sortItems();
    currentPage = 1; // Reset to first page
    updateTable();
    updatePagination();
}

// Table rendering
function updateTable() {
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    currentPage = Math.min(currentPage, totalPages) || 1;
    
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = filteredItems.slice(start, end);
    
    const html = pageItems.map(item => {
        const favicon = item.Link ? 
            `<img src="https://www.google.com/s2/favicons?sz=24&domain=${encodeURIComponent(item.Link)}" alt="favicon">` : '';
        
        return `
            <div class="item-card">
                <div class="item-header">
                    ${favicon}
                    <p><b>${item.Name}</b></p>
                </div>
                <div class="item-body">
                    <div class="item-info">
                        <p class="item-license">${item.License}</p>
                        <div>* * * * *</div>
                    </div>
                    <p class="item-desc">${item.Description}</p>
                </div>
                <div class="item-footer">
                    <img src=${item.Category} alt=" ">
                    <div class="item-tag-container">
                        <p>${item.Tags.join(", ")}</p>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    elements.itemGrid.innerHTML = html;
    elements.noResults.style.display = filteredItems.length === 0 ? 'block' : 'none';
}

function updatePagination() {
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    elements.pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    elements.prevPageBtn.disabled = currentPage === 1;
    elements.nextPageBtn.disabled = currentPage === totalPages;
}

function updateSortArrows() {
    document.querySelectorAll('.sort-arrow').forEach(arrow => arrow.textContent = '');
    const activeHeader = document.querySelector(`.sortable[data-column="${sortColumn}"]`);
    if (activeHeader) {
        const arrow = activeHeader.querySelector('.sort-arrow');
        if (arrow) arrow.textContent = sortDirection === 'asc' ? '↑' : '↓';
    }
}

// Event listeners
function setupEventListeners() {
    const debouncedUpdate = debounce(applyFiltersAndSort, 300);
    
    // Filter events
    elements.categoryFilter.addEventListener('change', applyFiltersAndSort);
    elements.licenseFilter.addEventListener('change', applyFiltersAndSort);
    elements.tagsFilter.addEventListener('input', debouncedUpdate);
    elements.nameFilter.addEventListener('input', debouncedUpdate);
    
    // Pagination events
    elements.prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updateTable();
            updatePagination();
        }
    });
    
    elements.nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            updateTable();
            updatePagination();
        }
    });
    
    // Sorting events
    document.querySelectorAll('.sortable').forEach(header => {
        header.addEventListener('click', () => {
            const column = header.dataset.column;
            if (sortColumn === column) {
                sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                sortColumn = column;
                sortDirection = 'asc';
            }
            applyFiltersAndSort();
            updateSortArrows();
        });
    });
}

// Initialize application
async function initialize() {
    await loadData();
    setupEventListeners();
    updateSortArrows();
}

initialize();
