
    // Navbar Toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }));

    // College Data Management
    let allColleges = [];
    let cities = new Set();

    // DOM Elements
    const collegeGrid = document.getElementById('collegeGrid');
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const noResults = document.getElementById('noResults');
    const retryButton = document.getElementById('retryButton');
    const searchInput = document.getElementById('searchInput');
    const typeFilter = document.getElementById('typeFilter');
    const cityFilter = document.getElementById('cityFilter');
    const courseFilter = document.getElementById('courseFilter');

    // ✅ List of all JSON files
    const jsonFiles = [
        "government.json",
        "private.json",
        // aur bhi ho to yaha add karo
    ];

    // Fetch college data from all JSON files
    async function fetchCollegeData() {
        try {
            loadingState.style.display = 'block';
            errorState.style.display = 'none';
            collegeGrid.innerHTML = '';

            // Fetch all JSON files
            const responses = await Promise.all(jsonFiles.map(file => fetch(file)));

            // Agar koi bhi file fetch fail ho gayi
            responses.forEach(res => {
                if (!res.ok) throw new Error(`Failed to fetch ${res.url}`);
            });

            // Parse sabka JSON
            const dataArrays = await Promise.all(responses.map(res => res.json()));

            // ✅ Combine all data in one array
            allColleges = dataArrays.flat();

            // Extract unique cities
            cities = new Set(allColleges.map(college => college.city));

            // Populate city filter
            populateCityFilter();

            // Display all colleges
            displayColleges(allColleges);

            loadingState.style.display = 'none';
        } catch (error) {
            console.error('Error fetching college data:', error);
            loadingState.style.display = 'none';
            errorState.style.display = 'block';
        }
    }

    // Populate city filter dropdown
    function populateCityFilter() {
        cityFilter.innerHTML = '<option value="all">All Cities</option>';
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            cityFilter.appendChild(option);
        });
    }

    // Display colleges in the grid
    function displayColleges(colleges) {
        collegeGrid.innerHTML = '';

        if (colleges.length === 0) {
            noResults.style.display = 'block';
            return;
        }

        noResults.style.display = 'none';

        colleges.forEach(college => {
            const collegeCard = document.createElement('div');
            collegeCard.className = 'college-card';

            // ✅ Agar image missing ho to fallback lagao
            const imageSrc = college.image
                ? college.image.replace(/ /g, '%20') // space fix
                : 'assets/images/default-college.jpg';

            collegeCard.innerHTML = `
                <span class="college-badge ${college.type ? college.type.toLowerCase() : 'unknown'}-badge">
                    ${college.type || 'Unknown'}
                </span>
                <div class="card-img">
                    <img src="${imageSrc}" alt="${college.name}">
                </div>
                <div class="card-content">
                    <h3 class="card-title">${college.name}</h3>
                    <p class="card-location"><i class="fas fa-map-marker-alt"></i> ${college.city}</p>
                    
                    <p class="card-description">${college.details || ''}</p>
                    
                    <div class="card-actions">
                        <a href="college-detail.html?id=${college.id}&type=${college.type}" class="btn">View Details</a>
                    </div>
                </div>
            `;

            collegeGrid.appendChild(collegeCard);
        });
    }

    // Filter colleges based on search and filters
    function filterColleges() {
        const searchTerm = searchInput.value.toLowerCase();
        const typeValue = typeFilter.value;
        const cityValue = cityFilter.value;
        const courseValue = courseFilter.value;

        const filteredColleges = allColleges.filter(college => {
            // Search term filter (name or city)
            const matchesSearch = searchTerm === '' ||
                (college.name && college.name.toLowerCase().includes(searchTerm)) ||
                (college.city && college.city.toLowerCase().includes(searchTerm));

            // Type filter
            const matchesType = typeValue === 'all' || college.type === typeValue;

            // City filter
            const matchesCity = cityValue === 'all' || college.city === cityValue;

            // Course filter (safe check)
            const matchesCourse = courseValue === 'all' ||
                (Array.isArray(college.courses) && college.courses.includes(courseValue));

            return matchesSearch && matchesType && matchesCity && matchesCourse;
        });

        displayColleges(filteredColleges);
    }

    // Event listeners for search and filters
    searchInput.addEventListener('input', filterColleges);
    typeFilter.addEventListener('change', filterColleges);
    cityFilter.addEventListener('change', filterColleges);
    courseFilter.addEventListener('change', filterColleges);
    retryButton.addEventListener('click', fetchCollegeData);

    // Initial data fetch
    fetchCollegeData();

