// ===== StreamZone JavaScript =====

document.addEventListener('DOMContentLoaded', () => {
    // Initialiser les sliders
    initSliders();
    // Initialiser la navigation
    initNavigation();
    // Initialiser la recherche
    initSearch();
    // Initialiser l'authentification
    initAuth();
});

// ===== Initialisation des sliders =====
async function initSliders() {
    try {
        // Tendance (mélange films + séries + animés)
        if (document.getElementById('trendingSlider')) {
            const [moviesTrending, seriesTrending, animeTrending] = await Promise.all([
                API.movies.getTrending(),
                API.series.getTrending(),
                API.anime.getTrending()
            ]);
            
            const allTrending = [
                ...(moviesTrending.results || []).slice(0, 4).map(m => ({...m, type: 'movie'})),
                ...(seriesTrending.results || []).slice(0, 4).map(s => ({...s, type: 'series'})),
                ...(animeTrending.results || []).slice(0, 4).map(a => ({...a, type: 'anime'}))
            ];
            
            renderSlider('trendingSlider', allTrending);
        }

        // Films
        if (document.getElementById('moviesSlider')) {
            const data = await API.movies.getPopular();
            const movies = (data.results || []).slice(0, 10).map(m => ({...m, type: 'movie'}));
            renderSlider('moviesSlider', movies);
        }

        // Animés
        if (document.getElementById('animeSlider')) {
            const data = await API.anime.getPopular();
            const anime = (data.results || []).slice(0, 10).map(a => ({...a, type: 'anime'}));
            renderSlider('animeSlider', anime);
        }

        // Séries
        if (document.getElementById('seriesSlider')) {
            const data = await API.series.getPopular();
            const series = (data.results || []).slice(0, 10).map(s => ({...s, type: 'series'}));
            renderSlider('seriesSlider', series);
        }

        // Récemment ajoutés
        if (document.getElementById('recentSlider')) {
            const data = await API.movies.getPopular(2);
            const recent = (data.results || []).slice(0, 10).map(m => ({...m, type: 'movie'}));
            renderSlider('recentSlider', recent);
        }
    } catch (error) {
        console.error('Erreur chargement sliders:', error);
    }
}

// ===== Rendu d'un slider =====
function renderSlider(sliderId, items) {
    const slider = document.getElementById(sliderId);
    if (!slider) return;

    slider.innerHTML = items.map(item => createContentCard(item)).join('');
}

// ===== Création d'une carte de contenu =====
function createContentCard(item) {
    const badge = item.type === 'anime' ? 'Animé' :
                  item.type === 'series' ? 'Série' : 'Film';

    // Gérer les images selon le type
    let imageUrl = '';
    if (item.poster_url) {
        imageUrl = item.poster_url;
    } else if (item.poster_path) {
        imageUrl = `https://image.tmdb.org/t/p/w500${item.poster_path}`;
    } else if (item.image) {
        imageUrl = item.image;
    }

    const title = item.title || item.name || 'Titre inconnu';
    const rating = item.averageRating || item.vote_average || 0;
    const year = item.startDate || item.year || item.release_date?.substring(0, 4) || '';
    const duration = item.episodeCount ? `${item.episodeCount} ép.` : item.duration || '';

    const onclick = item.type === 'anime' 
        ? `showAnimeModal('${item.id}')` 
        : `showContentModal('${item.type}', '${item.id}')`;

    return `
        <div class="content-card" onclick="${onclick}">
            <img src="${imageUrl}" alt="${title}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'">
            <div class="card-badge">${badge}</div>
            <div class="card-rating">
                <i class="fas fa-star"></i> ${typeof rating === 'number' ? rating.toFixed(1) : rating}
            </div>
            <div class="card-overlay">
                <div class="card-title">${title}</div>
                <div class="card-meta">
                    ${year ? `<span><i class="fas fa-calendar"></i> ${year}</span>` : ''}
                    ${duration ? `<span><i class="fas fa-clock"></i> ${duration}</span>` : ''}
                </div>
            </div>
        </div>
    `;
}

// ===== Navigation =====
function initNavigation() {
    const navbar = document.querySelector('.navbar');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '100%';
            navLinks.style.left = '0';
            navLinks.style.right = '0';
            navLinks.style.background = 'rgba(20, 20, 20, 0.98)';
            navLinks.style.flexDirection = 'column';
            navLinks.style.padding = '1rem 2rem';
            navLinks.style.gap = '1rem';
        });
    }
}

// ===== Recherche =====
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        
        if (query.length < 2) {
            hideSearchResults();
            return;
        }

        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 300);
    });

    // Fermer les résultats en cliquant ailleurs
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-box')) {
            hideSearchResults();
        }
    });
}

async function performSearch(query) {
    try {
        const [moviesResult, animeResult] = await Promise.all([
            API.movies.search(query),
            API.anime.search(query)
        ]);

        const results = [
            ...(moviesResult.results || []).slice(0, 3).map(m => ({...m, type: 'movie'})),
            ...(animeResult.results || []).slice(0, 3).map(a => ({...a, type: 'anime'}))
        ];

        showSearchResults(results);
    } catch (error) {
        console.error('Erreur recherche:', error);
    }
}

function showSearchResults(results) {
    let resultsContainer = document.getElementById('searchResults');

    if (!resultsContainer) {
        resultsContainer = document.createElement('div');
        resultsContainer.id = 'searchResults';
        resultsContainer.className = 'search-results';
        document.querySelector('.search-box').appendChild(resultsContainer);
    }

    if (results.length === 0) {
        resultsContainer.innerHTML = '<div class="search-no-results">Aucun résultat trouvé</div>';
    } else {
        resultsContainer.innerHTML = results.map(item => {
            let imageUrl = '';
            if (item.poster_url) {
                imageUrl = item.poster_url;
            } else if (item.poster_path) {
                imageUrl = `https://image.tmdb.org/t/p/w200${item.poster_path}`;
            }
            
            const title = item.title || item.name || 'Titre inconnu';
            const type = item.type === 'anime' ? 'Animé' : item.type === 'series' ? 'Série' : 'Film';
            const onclick = item.type === 'anime' 
                ? `showAnimeModal('${item.id}'); hideSearchResults();` 
                : `showContentModal('${item.type}', '${item.id}'); hideSearchResults();`;

            return `
                <div class="search-result-item" onclick="${onclick}">
                    <img src="${imageUrl}" alt="${title}" onerror="this.src='https://via.placeholder.com/50x75?text=No+Image'">
                    <div class="search-result-info">
                        <div class="search-result-title">${title}</div>
                        <div class="search-result-meta">${type}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    resultsContainer.style.display = 'block';
}

function hideSearchResults() {
    const resultsContainer = document.getElementById('searchResults');
    if (resultsContainer) {
        resultsContainer.style.display = 'none';
    }
}

// ===== Modals =====

// Modal pour films et séries
async function showContentModal(type, id) {
    const modal = document.getElementById('videoModal');
    const titleEl = document.getElementById('modalTitle');
    const descEl = document.getElementById('modalDescription');
    const yearEl = document.getElementById('modalYear');
    const ratingEl = document.getElementById('modalRating');
    const durationEl = document.getElementById('modalDuration');
    const videoContainer = document.querySelector('.video-container');

    try {
        let data;
        if (type === 'movie') {
            data = await API.movies.getById(id);
        } else {
            data = await API.series.getById(id);
        }

        const title = data.title || data.name;
        titleEl.textContent = title;
        descEl.textContent = data.overview || 'Aucune description disponible';
        yearEl.innerHTML = `<i class="fas fa-calendar"></i> ${(data.release_date || data.first_air_date || '').substring(0, 4)}`;
        ratingEl.innerHTML = `<i class="fas fa-star"></i> ${data.vote_average?.toFixed(1) || 'N/A'}`;
        durationEl.innerHTML = `<i class="fas fa-clock"></i> ${type === 'movie' ? `${data.runtime || '?'} min` : `${data.number_of_seasons || '?'} saisons`}`;

        // LECTEUR VIDÉO COMPLÈT via vidsrc.me
        if (type === 'movie') {
            // Film complet : embed direct
            videoContainer.innerHTML = `
                <iframe 
                    src="https://vidsrc.me/embed/movie?tmdb=${id}" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen
                    style="width: 100%; height: 600px; border-radius: 10px;">
                </iframe>
            `;
        } else {
            // Série : sélectionneur d'épisodes + lecteur
            const seasons = data.seasons || [];
            const validSeasons = seasons.filter(s => s.season_number > 0);
            
            let episodesHTML = '';
            if (validSeasons.length > 0) {
                const firstSeason = validSeasons[0];
                const episodeCount = firstSeason.episode_count || 1;
                episodesHTML = createEpisodeSelector(id, validSeasons, 1, episodeCount);
            }
            
            videoContainer.innerHTML = `
                <div class="episode-selector">
                    <div class="season-tabs">
                        ${validSeasons.map((s, i) => `
                            <button class="season-tab ${i === 0 ? 'active' : ''}" onclick="loadSeason(${id}, ${s.season_number}, ${s.episode_count})">
                                Saison ${s.season_number}
                            </button>
                        `).join('')}
                    </div>
                    <div class="episode-list" id="episodeList">
                        ${episodesHTML}
                    </div>
                </div>
                <div class="player-wrapper" id="playerWrapper">
                    <iframe 
                        src="https://vidsrc.me/embed/tv?tmdb=${id}&season=1&episode=1" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen
                        style="width: 100%; height: 600px; border-radius: 10px;">
                    </iframe>
                </div>
            `;
        }

        // Ajouter le bouton favori
        const isFav = await checkFavorite(type, id);
        const favBtn = document.createElement('button');
        favBtn.className = `btn-favorite ${isFav ? 'active' : ''}`;
        favBtn.innerHTML = `<i class="fas fa-heart"></i> ${isFav ? 'Dans les favoris' : 'Ajouter aux favoris'}`;
        favBtn.onclick = () => toggleFavorite(type, id, title, data.poster_url || `https://image.tmdb.org/t/p/w500${data.poster_path}`);
        
        const modalInfo = document.querySelector('.modal-info');
        const existingFavBtn = modalInfo.querySelector('.btn-favorite');
        if (existingFavBtn) existingFavBtn.remove();
        modalInfo.appendChild(favBtn);

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

    } catch (error) {
        console.error('Erreur chargement détails:', error);
        alert('Erreur lors du chargement des détails');
    }
}

// Modal pour animés
async function showAnimeModal(id) {
    const modal = document.getElementById('videoModal');
    const titleEl = document.getElementById('modalTitle');
    const descEl = document.getElementById('modalDescription');
    const yearEl = document.getElementById('modalYear');
    const ratingEl = document.getElementById('modalRating');
    const durationEl = document.getElementById('modalDuration');
    const videoContainer = document.querySelector('.video-container');

    try {
        const data = await API.anime.getById(id);

        titleEl.textContent = data.title;
        descEl.textContent = data.overview || 'Aucune description disponible';
        yearEl.innerHTML = `<i class="fas fa-calendar"></i> ${(data.release_date || '').substring(0, 4)}`;
        ratingEl.innerHTML = `<i class="fas fa-star"></i> ${data.vote_average || 'N/A'}`;
        durationEl.innerHTML = `<i class="fas fa-tv"></i> ${data.episodeCount || '?'} épisodes`;

        // Pour les animés, rechercher sur TMDB pour obtenir un ID TMDB
        let tmdbId = null;
        try {
            const searchResult = await tmdbFetch(`/search/tv?language=fr-FR&query=${encodeURIComponent(data.title)}`);
            if (searchResult.results && searchResult.results.length > 0) {
                tmdbId = searchResult.results[0].id;
            }
        } catch (e) {
            console.log('TMDB search failed for anime:', e);
        }

        if (tmdbId) {
            // Anime trouvé sur TMDB : lecteur complet avec épisodes
            const episodeCount = data.episodeCount || 24;
            let episodesHTML = createAnimeEpisodeSelector(tmdbId, episodeCount);
            
            videoContainer.innerHTML = `
                <div class="episode-selector">
                    <h3 style="color: white; margin-bottom: 10px;"><i class="fas fa-list"></i> Épisodes</h3>
                    <div class="episode-list anime-episodes" id="episodeList">
                        ${episodesHTML}
                    </div>
                </div>
                <div class="player-wrapper" id="playerWrapper">
                    <iframe 
                        src="https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=1&episode=1" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen
                        style="width: 100%; height: 600px; border-radius: 10px;">
                    </iframe>
                </div>
            `;
        } else if (data.trailer_embed) {
            // Fallback : bande-annonce YouTube
            videoContainer.innerHTML = `
                <iframe 
                    src="${data.trailer_embed}" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen
                    style="width: 100%; height: 600px; border-radius: 10px;">
                </iframe>
                <p style="color: #888; text-align: center; margin-top: 10px; font-size: 0.9rem;">
                    <i class="fas fa-info-circle"></i> Bande-annonce disponible. Le film complet n'est pas encore disponible sur TMDB.
                </p>
            `;
        } else {
            videoContainer.innerHTML = `
                <div style="padding: 4rem; text-align: center; background: #1a1a2e; border-radius: 10px;">
                    <i class="fas fa-dragon" style="font-size: 4rem; color: #e50914; margin-bottom: 1rem;"></i>
                    <p style="color: #b3b3b3;">Aucune vidéo disponible pour cet anime</p>
                    <p style="color: #666; font-size: 0.9rem; margin-top: 0.5rem;">Ajoutez aux favoris pour le regarder plus tard</p>
                </div>
            `;
        }

        // Ajouter le bouton favori
        const isFav = await checkFavorite('anime', id);
        const favBtn = document.createElement('button');
        favBtn.className = `btn-favorite ${isFav ? 'active' : ''}`;
        favBtn.innerHTML = `<i class="fas fa-heart"></i> ${isFav ? 'Dans les favoris' : 'Ajouter aux favoris'}`;
        favBtn.onclick = () => toggleFavorite('anime', id, data.title, data.poster_url);
        
        const modalInfo = document.querySelector('.modal-info');
        const existingFavBtn = modalInfo.querySelector('.btn-favorite');
        if (existingFavBtn) existingFavBtn.remove();
        modalInfo.appendChild(favBtn);

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

    } catch (error) {
        console.error('Erreur chargement anime:', error);
        alert('Erreur lors du chargement de l\'anime');
    }
}

// ===== Fonctions épisodes =====

function createEpisodeSelector(seriesId, seasons, currentSeason, episodeCount) {
    let html = '';
    for (let ep = 1; ep <= episodeCount; ep++) {
        html += `
            <button class="episode-btn ${ep === 1 ? 'active' : ''}" 
                    onclick="playEpisode(${seriesId}, ${currentSeason}, ${ep}, this)">
                <span class="ep-number">E${ep}</span>
            </button>
        `;
    }
    return html;
}

function createAnimeEpisodeSelector(tmdbId, episodeCount) {
    let html = '';
    for (let ep = 1; ep <= Math.min(episodeCount, 100); ep++) {
        html += `
            <button class="episode-btn ${ep === 1 ? 'active' : ''}" 
                    onclick="playEpisode(${tmdbId}, 1, ${ep}, this)">
                <span class="ep-number">E${ep}</span>
            </button>
        `;
    }
    return html;
}

function playEpisode(seriesId, season, episode, btnEl) {
    // Mettre à jour les boutons actifs
    document.querySelectorAll('.episode-btn').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    
    // Charger l'épisode dans le lecteur
    const wrapper = document.getElementById('playerWrapper') || document.querySelector('.video-container');
    wrapper.innerHTML = `
        <iframe 
            src="https://vidsrc.me/embed/tv?tmdb=${seriesId}&season=${season}&episode=${episode}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
            style="width: 100%; height: 600px; border-radius: 10px;">
        </iframe>
    `;
    
    // Scroll vers le lecteur
    wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function loadSeason(seriesId, seasonNumber, episodeCount) {
    // Mettre à jour l'onglet actif
    document.querySelectorAll('.season-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    // Générer la liste des épisodes
    const episodeList = document.getElementById('episodeList');
    episodeList.innerHTML = createEpisodeSelector(seriesId, [], seasonNumber, episodeCount);
    
    // Jouer le premier épisode
    playEpisode(seriesId, seasonNumber, 1, episodeList.querySelector('.episode-btn'));
}

function closeModal() {
    const modal = document.getElementById('videoModal');
    const videoContainer = document.querySelector('.video-container');

    modal.classList.remove('active');
    document.body.style.overflow = 'auto';

    // Réinitialiser le conteneur vidéo
    videoContainer.innerHTML = `
        <video id="videoPlayer" controls>
            <source src="" type="video/mp4">
            Votre navigateur ne supporte pas la vidéo HTML5.
        </video>
    `;
}

// Fermer le modal avec Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Fermer le modal en cliquant en dehors
document.addEventListener('click', (e) => {
    if (e.target.id === 'videoModal') {
        closeModal();
    }
});

// ===== Favoris =====

function checkFavorite(type, contentId) {
    return API.favorites.isFavorite(contentId, type);
}

function toggleFavorite(type, contentId, title, posterUrl) {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) {
        showAuthModal();
        return;
    }

    try {
        const isFav = API.favorites.isFavorite(contentId, type);
        if (isFav) {
            API.favorites.remove(contentId, type);
        } else {
            API.favorites.add(contentId, type, title, posterUrl);
        }
        
        // Mettre à jour le bouton
        const favBtn = document.querySelector('.btn-favorite');
        if (favBtn) {
            const newIsFav = API.favorites.isFavorite(contentId, type);
            favBtn.className = `btn-favorite ${newIsFav ? 'active' : ''}`;
            favBtn.innerHTML = `<i class="fas fa-heart"></i> ${newIsFav ? 'Dans les favoris' : 'Ajouter aux favoris'}`;
        }
    } catch (error) {
        console.error('Erreur favoris:', error);
    }
}

// ===== Authentification =====

function initAuth() {
    updateAuthUI();
}

function updateAuthUI() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const authBtn = document.querySelector('.btn-login');
    
    if (token && user) {
        authBtn.textContent = user.username;
        authBtn.onclick = showUserMenu;
    } else {
        authBtn.textContent = 'Connexion';
        authBtn.onclick = showAuthModal;
    }
}

function showAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // Simple localStorage auth
    const users = JSON.parse(localStorage.getItem('streamzone_users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        localStorage.setItem('user', JSON.stringify({ id: user.id, username: user.username, email: user.email }));
        closeAuthModal();
        updateAuthUI();
        alert('Connexion réussie !');
    } else {
        alert('Email ou mot de passe incorrect');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    // Simple localStorage auth
    const users = JSON.parse(localStorage.getItem('streamzone_users') || '[]');
    if (users.find(u => u.email === email)) {
        alert('Cet email est déjà utilisé');
        return;
    }
    
    const newUser = { id: Date.now(), username, email, password };
    users.push(newUser);
    localStorage.setItem('streamzone_users', JSON.stringify(users));
    localStorage.setItem('user', JSON.stringify({ id: newUser.id, username: newUser.username, email: newUser.email }));
    closeAuthModal();
    updateAuthUI();
    alert('Compte créé avec succès !');
}

function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateAuthUI();
    closeUserMenu();
}

function showUserMenu() {
    const menu = document.getElementById('userMenu');
    if (menu) {
        menu.classList.toggle('active');
    }
}

function closeUserMenu() {
    const menu = document.getElementById('userMenu');
    if (menu) {
        menu.classList.remove('active');
    }
}

// ===== Export des fonctions =====
if (typeof window !== 'undefined') {
    window.showContentModal = showContentModal;
    window.showAnimeModal = showAnimeModal;
    window.closeModal = closeModal;
    window.closeAuthModal = closeAuthModal;
    window.handleLogin = handleLogin;
    window.handleRegister = handleRegister;
    window.handleLogout = handleLogout;
    window.showAuthModal = showAuthModal;
    window.showUserMenu = showUserMenu;
    window.closeUserMenu = closeUserMenu;
    window.hideSearchResults = hideSearchResults;
}
