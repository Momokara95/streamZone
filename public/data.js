// ===== Base de données de contenu =====

const contentData = {
    // Films
    movies: [
        {
            id: 'm1',
            title: 'Inception',
            description: 'Un voleur spécialisé dans l\'extraction de secrets pendant le sommeil se voit offrir une chance de retrouver sa vie d\'avant.',
            year: 2010,
            rating: 8.8,
            duration: '2h 28min',
            genre: 'Science-Fiction',
            image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400',
            video: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
            type: 'movie'
        },
        {
            id: 'm2',
            title: 'The Dark Knight',
            description: 'Batman doit accepter l\'une des plus grandes épreuves psychologiques et physiques pour combattre l\'injustice.',
            year: 2008,
            rating: 9.0,
            duration: '2h 32min',
            genre: 'Action',
            image: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400',
            video: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
            type: 'movie'
        },
        {
            id: 'm3',
            title: 'Interstellar',
            description: 'Un groupe d\'explorateurs voyage à travers un trou de ver dans l\'espace dans le but de trouver une nouvelle maison pour l\'humanité.',
            year: 2014,
            rating: 8.6,
            duration: '2h 49min',
            genre: 'Science-Fiction',
            image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400',
            video: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
            type: 'movie'
        },
        {
            id: 'm4',
            title: 'The Matrix',
            description: 'Un programmeur découvre que la réalité telle qu\'il la connaît est une simulation créée par des machines.',
            year: 1999,
            rating: 8.7,
            duration: '2h 16min',
            genre: 'Science-Fiction',
            image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400',
            video: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
            type: 'movie'
        },
        {
            id: 'm5',
            title: 'Fight Club',
            description: 'Un employé de bureau insomniaque et un savonnier imprévisible forment un club de combat clandestin.',
            year: 1999,
            rating: 8.8,
            duration: '2h 19min',
            genre: 'Drame',
            image: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=400',
            video: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
            type: 'movie'
        },
        {
            id: 'm6',
            title: 'Pulp Fiction',
            description: 'Les vies de deux tueurs à gages, de boxeurs et de la femme d\'un gangster s\'entremêlent dans quatre histoires de violence et de rédemption.',
            year: 1994,
            rating: 8.9,
            duration: '2h 34min',
            genre: 'Crime',
            image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400',
            video: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
            type: 'movie'
        },
        {
            id: 'm7',
            title: 'Le Parrain',
            description: 'L\'histoire de la famille Corleone, une puissante dynastie de la mafia italo-américaine.',
            year: 1972,
            rating: 9.2,
            duration: '2h 55min',
            genre: 'Crime',
            image: 'https://images.unsplash.com photo-1440404653325-ab127d49abc1?w=400',
            video: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
            type: 'movie'
        },
        {
            id: 'm8',
            title: 'Forrest Gump',
            description: 'Un homme simple d\'esprit raconte les événements majeurs de la seconde moitié du XXe siècle américains.',
            year: 1994,
            rating: 8.8,
            duration: '2h 22min',
            genre: 'Drame',
            image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400',
            video: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
            type: 'movie'
        },
        {
            id: 'm9',
            title: 'Gladiator',
            description: 'Un puissant général romain est trahi et réduit en esclavage. Il doit combattre dans le Colisée pour se venger.',
            year: 2000,
            rating: 8.5,
            duration: '2h 35min',
            genre: 'Action',
            image: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400',
            video: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
            type: 'movie'
        },
        {
            id: 'm10',
            title: 'Django Unchained',
            description: 'Un esclave affranchi part à la recherche de sa femme avec l\'aide d\'un chasseur de primes allemand.',
            year: 2012,
            rating: 8.4,
            duration: '2h 45min',
            genre: 'Western',
            image: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400',
            video: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
            type: 'movie'
        }
    ],

    // Animés
    anime: [
        {
            id: 'a1',
            title: 'Attack on Titan',
            description: 'L\'humanité vit retranchée derrière d\'immenses murs pour se protéger de titans géants dévoreurs d\'hommes.',
            year: 2013,
            rating: 9.0,
            duration: '24min/ep',
            genre: 'Action',
            image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400',
            video: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
            type: 'anime',
            episodes: 87
        },
        {
            id: 'a2',
            title: 'Demon Slayer',
            description: 'Tanjiro Kamado devient un chasseur de démons après le massacre de sa famille et la transformation de sa sœur en démon.',
            year: 2019,
            rating: 8.7,
            duration: '23min/ep',
            genre: 'Action',
            image: 'https://images.unsplash.com/photo-1560972550-aba3456b5564?w=400',
            video: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
            type: 'anime',
            episodes: 55
        },
        {
            id: 'a3',
            title: 'Death Note',
            description: 'Un lycéen de génie trouve un cahier surnaturel lui permettant de tuer quiconque dont il écrit le nom.',
            year: 2006,
            rating: 9.0,
            duration: '23min/ep',
            genre: 'Thriller',
            image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400',
            video: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
            type: 'anime',
            episodes: 37
        },
        {
            id: 'a4',
            title: 'One Piece',
            description: 'Monkey D. Luffy part en mer avec son équipage pour trouver le trésor légendaire One Piece et devenir le Roi des Pirates.',
            year: 1999,
            rating: 9.0,
            duration: '24min/ep',
            genre: 'Aventure',
            image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400',
            video: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
            type: 'anime',
            episodes: 1100
        },
        {
            id: 'a5',
            title: 'Naruto',
            description: 'Un jeune ninja rebelle rêve de devenir le chef de son village et de gagner le respect de ses concitoyens.',
            year: 2002,
            rating: 8.4,
            duration: '23min/ep',
            genre: 'Action',
            image: 'https://images.unsplash.com/photo-1515488764276-beab923e2e1e?w=400',
            video: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
            type: 'anime',
            episodes: 720
        },
        {
            id: 'a6',
            title: 'Fullmetal Alchemist',
            description: 'Deux frères alchimistes cherchent la pierre philosophale pour restaurer leurs corps après une tentative ratée de résurrection.',
            year: 2009,
            rating: 9.2,
            duration: '24min/ep',
            genre: 'Aventure',
            image: 'https://images.unsplash.com/photo-1541562242702-7940f0471c33?w=400',
            video: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
            type: 'anime',
            episodes: 64
        },
        {
            id: 'a7',
            title: 'Jujutsu Kaisen',
            description: 'Un lycéen avale un doigt maudit et se retrouve plongé dans le monde des exorcistes.',
            year: 2020,
            rating: 8.6,
            duration: '23min/ep',
            genre: 'Action',
            image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400',
            video: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
            type: 'anime',
            episodes: 47
        },
        {
            id: 'a8',
            title: 'My Hero Academia',
            description: 'Dans un monde où 80% de la population possède des super-pouvoirs, un garçon sans pouvoir rêve de devenir héros.',
            year: 2016,
            rating: 8.4,
            duration: '24min/ep',
            genre: 'Action',
            image: 'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=400',
            video: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
            type: 'anime',
            episodes: 138
        },
        {
            id: 'a9',
            title: 'Steins;Gate',
            description: 'Un scientifique autoproclamé fou découvre qu\'il a créé une machine capable d\'envoyer des messages dans le passé.',
            year: 2011,
            rating: 9.1,
            duration: '24min/ep',
            genre: 'Science-Fiction',
            image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400',
            video: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
            type: 'anime',
            episodes: 24
        },
        {
            id: 'a10',
            title: 'Hunter x Hunter',
            description: 'Un jeune garçon part à la recherche de son père, un célèbre hunter, en passant des examens dangereux.',
            year: 2011,
            rating: 9.1,
            duration: '23min/ep',
            genre: 'Aventure',
            image: 'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=400',
            video: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
            type: 'anime',
            episodes: 148
        }
    ],

    // Séries
    series: [
        {
            id: 's1',
            title: 'Breaking Bad',
            description: 'Un professeur de chimie atteint d\'un cancer se lance dans la fabrication de méthamphétamine pour assurer l\'avenir financier de sa famille.',
            year: 2008,
            rating: 9.5,
            duration: '5 saisons',
            genre: 'Drame',
            image: 'https://images.unsplash.com/photo-1504711434969-e33886168d5c?w=400',
            video: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
            type: 'series',
            episodes: 62
        },
        {
            id: 's2',
            title: 'Game of Thrones',
            description: 'Noble famille lutte pour le contrôle des terres mythiques tandis qu\'un ancien ennemi revient après des millénaires.',
            year: 2011,
            rating: 9.3,
            duration: '8 saisons',
            genre: 'Fantasy',
            image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400',
            video: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
            type: 'series',
            episodes: 73
        },
        {
            id: 's3',
            title: 'Stranger Things',
            description: 'Un groupe d\'amis découvre des phénomènes surnaturels et un monde parallèle appelé "le Sens Inverse".',
            year: 2016,
            rating: 8.7,
            duration: '4 saisons',
            genre: 'Science-Fiction',
            image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400',
            video: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
            type: 'series',
            episodes: 34
        },
        {
            id: 's4',
            title: 'The Witcher',
            description: 'Geralt de Riv, un chasseur de monstres solitaire, lutte pour trouver sa place dans un monde où les humains se révèlent souvent plus cruels que les bêtes.',
            year: 2019,
            rating: 8.2,
            duration: '3 saisons',
            genre: 'Fantasy',
            image: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400',
            video: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
            type: 'series',
            episodes: 24
        },
        {
            id: 's5',
            title: 'The Mandalorian',
            description: 'Un chasseur de primes solitaire voyage dans les confins de la galaxie, loin de l\'autorité de la Nouvelle République.',
            year: 2019,
            rating: 8.7,
            duration: '3 saisons',
            genre: 'Science-Fiction',
            image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400',
            video: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
            type: 'series',
            episodes: 24
        },
        {
            id: 's6',
            title: 'Peaky Blinders',
            description: 'Une famille de gangsters opère dans les rues de Birmingham, en Angleterre, après la Première Guerre mondiale.',
            year: 2013,
            rating: 8.8,
            duration: '6 saisons',
            genre: 'Crime',
            image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400',
            video: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
            type: 'series',
            episodes: 36
        },
        {
            id: 's7',
            title: 'The Last of Us',
            description: 'Vingt ans après la destruction de la civilisation moderne, Joel est engagé pour faire sortir Ellie d\'une zone de quarantaine.',
            year: 2023,
            rating: 8.8,
            duration: '1 saison',
            genre: 'Drame',
            image: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=400',
            video: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
            type: 'series',
            episodes: 9
        },
        {
            id: 's8',
            title: 'Wednesday',
            description: 'Wednesday Addams enquête sur une série de meurtres tout en se liant d\'amitié avec des monstres à Nevermore Academy.',
            year: 2022,
            rating: 8.1,
            duration: '1 saison',
            genre: 'Comédie',
            image: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400',
            video: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
            type: 'series',
            episodes: 8
        },
        {
            id: 's9',
            title: 'Squid Game',
            description: 'Des centaines de joueurs fauchés acceptent une étrange invitation à participer à des jeux pour enfants.',
            year: 2021,
            rating: 8.0,
            duration: '1 saison',
            genre: 'Thriller',
            image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400',
            video: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
            type: 'series',
            episodes: 9
        },
        {
            id: 's10',
            title: 'Chernobyl',
            description: 'L\'histoire vraie de la catastrophe nucléaire de Tchernobyl en 1986 et des sacrifices héroïques faits pour sauver l\'Europe.',
            year: 2019,
            rating: 9.4,
            duration: '1 saison',
            genre: 'Drame',
            image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400',
            video: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
            type: 'series',
            episodes: 5
        }
    ],

    // Contenu tendance (mélange)
    trending: [],
    recent: []
};

// Générer le contenu tendance et récent
contentData.trending = [
    contentData.movies[0],
    contentData.anime[0],
    contentData.series[0],
    contentData.movies[2],
    contentData.anime[2],
    contentData.series[2],
    contentData.movies[5],
    contentData.anime[5]
];

contentData.recent = [
    contentData.anime[6],
    contentData.series[7],
    contentData.movies[9],
    contentData.anime[8],
    contentData.series[8],
    contentData.movies[7],
    contentData.anime[7],
    contentData.series[6]
];

// Fonction pour obtenir tout le contenu
function getAllContent() {
    return [
        ...contentData.movies,
        ...contentData.anime,
        ...contentData.series
    ];
}

// Fonction pour rechercher du contenu
function searchContent(query) {
    const allContent = getAllContent();
    const lowerQuery = query.toLowerCase();
    return allContent.filter(item =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.genre.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery)
    );
}

// Fonction pour obtenir un élément par ID
function getContentById(id) {
    const allContent = getAllContent();
    return allContent.find(item => item.id === id);
}
