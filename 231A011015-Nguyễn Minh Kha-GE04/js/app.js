/**
 * Project: Movie Discovery App
 * Student: Nguyễn Minh Kha - 231A011015
 */

// --- 1. DỮ LIỆU PHIM (Đã thêm ảnh bìa và mô tả chi tiết) ---
const movies = [
    { 
        id: 1, 
        title: "The Dark Knight", 
        year: 2008, 
        genres: ["Hành động", "Kịch tính"], 
        poster: "images/dark_knight.jpg",
        desc: "Batman đối mặt với Joker trong cuộc chiến bảo vệ thành phố Gotham."
    },
    { 
        id: 2, 
        title: "Inception", 
        year: 2010, 
        genres: ["Hành động", "Khoa học viễn tưởng"], 
        poster: "images/inception.jpg",
        desc: "Kẻ trộm giấc mơ thực hiện phi vụ cuối cùng để lấy lại cuộc đời."
    },
    { 
        id: 3, 
        title: "Toy Story", 
        year: 1995, 
        genres: ["Hoạt hình", "Hài hước"], 
        poster: "images/toy_story.jpg",
        desc: "Cuộc phiêu lưu của những đồ chơi có sự sống khi chủ nhân vắng nhà."
    },
    { 
        id: 4, 
        title: "The Hangover", 
        year: 2009, 
        genres: ["Hài hước"], 
        poster: "images/hangover.jpg",
        desc: "Ba người bạn thức dậy sau một đêm tiệc tùng mà không nhớ gì về chú rể mất tích."
    },
    { 
        id: 5, 
        title: "Avatar", 
        year: 2009, 
        genres: ["Hành động", "Phiêu lưu"], 
        poster: "images/avatar.jpg",
        desc: "Một người lính trên hành tinh Pandora đứng giữa hai thế giới."
    }
];

// --- 2. KHAI BÁO BIẾN DOM ---
const mainContent = document.getElementById('main');
const sidebar = document.querySelector('.sidebar');
const modal = document.getElementById('movie-modal');
const modalBody = document.getElementById('modal-body');
const closeBtn = document.querySelector('.close-btn');
const themeToggle = document.getElementById('theme-toggle');
const htmlEl = document.documentElement;

let selectedGenres = []; 
let searchTerm = "";

// --- 3. QUẢN LÝ GIAO DIỆN (Light/Dark Mode & LocalStorage) ---
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark'; //
    htmlEl.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    if (theme === 'light') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

themeToggle.addEventListener('click', () => {
    const isDark = htmlEl.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    
    htmlEl.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme); //
    updateThemeIcon(newTheme);
});

// --- 4. HIỂN THỊ PHIM (Render Cards) ---
function displayMovies(moviesToRender) {
    if (!mainContent) return;
    
    if (moviesToRender.length === 0) {
        mainContent.innerHTML = `<p style="grid-column: 1/-1; text-align: center;">Không tìm thấy phim phù hợp.</p>`;
        return;
    }

    mainContent.innerHTML = moviesToRender.map(movie => `
        <article class="movie-card" onclick="openModal(${movie.id})">
            <img src="${movie.poster}" alt="${movie.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'">
            <div class="movie-info">
                <h3>${movie.title}</h3>
                <span>${movie.year}</span>
            </div>
        </article>
    `).join('');
}

// --- 5. BỘ LỌC VÀ TÌM KIẾM (Tư duy tích hợp & Debounce) ---
function filterMovies() {
    const filtered = movies.filter(movie => {
        const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGenre = selectedGenres.length === 0 || 
                             selectedGenres.every(g => movie.genres.includes(g)); //
        return matchesSearch && matchesGenre;
    });
    displayMovies(filtered);
}

function debounce(func, timeout = 400) { //
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

const processSearch = debounce((e) => {
    searchTerm = e.target.value;
    filterMovies();
});

function setupFilters() {
    if (!sidebar) return;

    // Tạo ô Tìm kiếm trong Sidebar
    const searchDiv = document.createElement('div');
    searchDiv.className = "filter-group";
    searchDiv.innerHTML = `
        <h4>Tìm kiếm</h4>
        <input type="text" id="side-search" placeholder="Nhập tên phim..." class="search" style="width: 100%; padding: 10px; margin: 10px 0; border-radius: 8px; background: var(--card-bg); color: var(--text-color); border: 1px solid #444;">
    `;
    searchDiv.querySelector('input').addEventListener('input', processSearch);
    sidebar.appendChild(searchDiv);

    // Tự động tạo Checkbox Thể loại (Không hard-code)
    const allGenres = [...new Set(movies.flatMap(m => m.genres))];
    const genreDiv = document.createElement('div');
    genreDiv.className = "filter-group";
    genreDiv.innerHTML = '<h4>Thể loại</h4>';
    
    allGenres.forEach(genre => {
        const wrapper = document.createElement('div');
        wrapper.style.margin = "8px 0";
        wrapper.innerHTML = `
            <input type="checkbox" value="${genre}" id="genre-${genre}" style="cursor:pointer">
            <label for="genre-${genre}" style="cursor:pointer; margin-left: 5px;">${genre}</label>
        `;
        
        wrapper.querySelector('input').addEventListener('change', (e) => {
            if (e.target.checked) selectedGenres.push(genre);
            else selectedGenres = selectedGenres.filter(g => g !== genre);
            filterMovies();
        });
        genreDiv.appendChild(wrapper);
    });
    sidebar.appendChild(genreDiv);
}

// --- 6. XỬ LÝ MODAL CHI TIẾT ---
function openModal(movieId) {
    const movie = movies.find(m => m.id === movieId);
    if (!movie) return;

    modalBody.innerHTML = `
        <img src="${movie.poster}" onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'" style="width: 100%; max-width: 250px; border-radius: 10px;">
        <div class="modal-info" style="flex: 1; padding-left: 20px;">
            <h2 style="color: var(--primary-color);">${movie.title}</h2>
            <p><strong>Năm:</strong> ${movie.year}</p>
            <p><strong>Thể loại:</strong> ${movie.genres.join(', ')}</p>
            <hr style="margin: 15px 0; border: 0; border-top: 1px solid #444;">
            <p>${movie.desc}</p>
            <p style="font-size: 0.8rem; color: gray; margin-top: 10px;">MSSV: 231A011015</p>
        </div>
    `;
    modal.style.display = "flex"; //
}

function closeModal() {
    modal.style.display = "none";
}

if (closeBtn) closeBtn.onclick = closeModal;
window.onclick = (e) => { if (e.target === modal) closeModal(); };

// --- 7. KHỞI CHẠY ---
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupFilters();
    displayMovies(movies);
});