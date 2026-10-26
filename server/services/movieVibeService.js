// ============================================================
// GENZSHOW MOVIE VIBE SERVICE
// ============================================================

const normalizeText = (value) => {
    return String(value || "")
        .toLowerCase()
        .trim();
};


// ============================================================
// TMDB GENRE MAP
// ============================================================

const TMDB_GENRES = {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    36: "History",
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "ScienceFiction",
    10770: "TV Movie",
    53: "Thriller",
    10752: "War",
    37: "Western",
};


// ============================================================
// KEYWORDS
// ============================================================

const MOOD_KEYWORDS = {
    funny: [
        "funny",
        "comedy",
        "hilarious",
        "laugh",
        "laughing",
        "lighthearted",
        "humorous",
    ],

    scary: [
        "scary",
        "horror",
        "terrifying",
        "ghost",
        "haunted",
        "creepy",
        "spooky",
    ],

    romantic: [
        "romantic",
        "romance",
        "love",
        "date",
        "relationship",
        "couple",
    ],

    action: [
        "action",
        "intense",
        "fight",
        "fighting",
        "war",
        "explosive",
        "adrenaline",
    ],

    emotional: [
        "emotional",
        "sad",
        "cry",
        "crying",
        "heartbreaking",
        "touching",
        "deep",
    ],

    mindBending: [
        "mind bending",
        "mind-bending",
        "mindblowing",
        "mind blowing",
        "twist",
        "twisty",
        "psychological",
        "confusing",
        "complex",
        "smart",
    ],

    relaxing: [
        "relaxing",
        "relax",
        "chill",
        "calm",
        "comfort",
        "cozy",
    ],

    adventurous: [
        "adventure",
        "adventurous",
        "explore",
        "journey",
        "epic",
    ],
};


const GENRE_KEYWORDS = {
    Action: [
        "action",
        "fight",
        "fighting",
        "war",
        "combat",
    ],

    Adventure: [
        "adventure",
        "adventurous",
        "journey",
        "explore",
    ],

    Animation: [
        "animation",
        "animated",
        "cartoon",
    ],

    Comedy: [
        "comedy",
        "funny",
        "hilarious",
        "laugh",
    ],

    Crime: [
        "crime",
        "criminal",
        "gangster",
        "mafia",
        "detective",
    ],

    Documentary: [
        "documentary",
        "documentaries",
    ],

    Drama: [
        "drama",
        "dramatic",
    ],

    Family: [
        "family",
        "kids",
        "children",
    ],

    Fantasy: [
        "fantasy",
        "magical",
        "magic",
        "wizard",
    ],

    Horror: [
        "horror",
        "scary",
        "ghost",
        "haunted",
        "creepy",
        "spooky",
    ],

    Mystery: [
        "mystery",
        "mysterious",
        "detective",
        "puzzle",
    ],

    Romance: [
        "romance",
        "romantic",
        "love",
        "date",
        "couple",
    ],

    ScienceFiction: [
        "science fiction",
        "sci-fi",
        "scifi",
        "space",
        "future",
        "alien",
    ],

    Thriller: [
        "thriller",
        "suspense",
        "suspenseful",
        "intense",
        "twist",
    ],
};


const AUDIENCE_KEYWORDS = {
    solo: [
        "alone",
        "solo",
        "myself",
        "by myself",
    ],

    friends: [
        "friends",
        "friend",
        "group",
        "gang",
        "buddies",
    ],

    family: [
        "family",
        "parents",
        "kids",
        "children",
    ],

    date: [
        "date",
        "partner",
        "girlfriend",
        "boyfriend",
        "couple",
        "wife",
        "husband",
    ],
};


const LANGUAGE_KEYWORDS = {
    hindi: [
        "hindi",
        "bollywood",
    ],

    english: [
        "english",
        "hollywood",
    ],

    tamil: [
        "tamil",
    ],

    telugu: [
        "telugu",
    ],

    malayalam: [
        "malayalam",
    ],

    kannada: [
        "kannada",
    ],

    korean: [
        "korean",
        "k-drama",
    ],
};


// ============================================================
// KEYWORD MATCH
// ============================================================

const containsKeyword = (
    text,
    keyword
) => {

    if (
        keyword.includes(" ")
    ) {
        return text.includes(
            keyword
        );
    }

    return text
        .split(/\s+/)
        .includes(keyword);
};


const findCategory = (
    text,
    dictionary
) => {

    const matches = [];

    Object.entries(
        dictionary
    ).forEach(
        ([
            category,
            keywords,
        ]) => {

            if (
                keywords.some(
                    (keyword) =>
                        containsKeyword(
                            text,
                            keyword
                        )
                )
            ) {
                matches.push(
                    category
                );
            }
        }
    );

    return matches;
};


// ============================================================
// RUNTIME
// ============================================================

const parseRuntime = (
    text
) => {

    if (
        /under\s+90/.test(
            text
        )
    ) {
        return {
            minRuntime: null,
            maxRuntime: 90,
        };
    }


    if (
        /under\s+2\s*hours?/.test(
            text
        ) ||
        /less\s+than\s+2\s*hours?/.test(
            text
        )
    ) {
        return {
            minRuntime: null,
            maxRuntime: 120,
        };
    }


    if (
        /2\+?\s*hours?/.test(
            text
        ) ||
        /more\s+than\s+2\s*hours?/.test(
            text
        )
    ) {
        return {
            minRuntime: 120,
            maxRuntime: null,
        };
    }


    const minutesMatch =
        text.match(
            /(?:under|less than|max(?:imum)?|within)\s+(\d{2,3})\s*(?:minutes?|mins?)/i
        );


    if (
        minutesMatch
    ) {
        return {
            minRuntime: null,
            maxRuntime:
                Number(
                    minutesMatch[1]
                ),
        };
    }


    return {
        minRuntime: null,
        maxRuntime: null,
    };
};


// ============================================================
// RATING
// ============================================================

const parseRating = (
    text
) => {

    const match =
        text.match(
            /(?:rating|rated|score)\s*(?:above|over|greater than|at least)?\s*(\d(?:\.\d)?)/i
        );

    return match
        ? Number(match[1])
        : null;
};


// ============================================================
// PARSE VIBE
// ============================================================

export const parseMovieVibe = (
    prompt
) => {

    const text =
        normalizeText(
            prompt
        );


    const moods =
        findCategory(
            text,
            MOOD_KEYWORDS
        );


    const genres =
        findCategory(
            text,
            GENRE_KEYWORDS
        );


    const audiences =
        findCategory(
            text,
            AUDIENCE_KEYWORDS
        );


    const languages =
        findCategory(
            text,
            LANGUAGE_KEYWORDS
        );


    const runtime =
        parseRuntime(
            text
        );


    return {

        originalPrompt:
            prompt,

        mood:
            moods[0] ||
            null,

        moods,

        genres,

        audience:
            audiences[0] ||
            null,

        audiences,

        language:
            languages[0] ||
            null,

        languages,

        minRuntime:
            runtime.minRuntime,

        maxRuntime:
            runtime.maxRuntime,

        minRating:
            parseRating(
                text
            ),
    };
};


// ============================================================
// MOVIE GENRES
// ============================================================

const getMovieGenres = (
    movie
) => {

    const genres = [];


    // --------------------------------------------------------
    // Normal Movie documents
    // --------------------------------------------------------

    if (
        Array.isArray(
            movie?.genres
        )
    ) {

        movie.genres.forEach(
            (genre) => {

                if (
                    typeof genre ===
                    "object" &&
                    genre !== null
                ) {

                    if (
                        genre.name
                    ) {

                        genres.push(
                            normalizeText(
                                genre.name
                            )
                        );

                    } else if (
                        genre.id
                    ) {

                        const name =
                            TMDB_GENRES[
                                genre.id
                            ];

                        if (
                            name
                        ) {
                            genres.push(
                                normalizeText(
                                    name
                                )
                            );
                        }
                    }

                } else {

                    const numericId =
                        Number(
                            genre
                        );


                    if (
                        TMDB_GENRES[
                            numericId
                        ]
                    ) {

                        genres.push(
                            normalizeText(
                                TMDB_GENRES[
                                    numericId
                                ]
                            )
                        );

                    } else {

                        genres.push(
                            normalizeText(
                                genre
                            )
                        );
                    }
                }
            }
        );
    }


    // --------------------------------------------------------
    // TMDB-style genre_ids
    // --------------------------------------------------------

    if (
        Array.isArray(
            movie?.genre_ids
        )
    ) {

        movie.genre_ids.forEach(
            (id) => {

                const genreName =
                    TMDB_GENRES[
                        Number(id)
                    ];


                if (
                    genreName
                ) {

                    genres.push(
                        normalizeText(
                            genreName
                        )
                    );
                }
            }
        );
    }


    return [
        ...new Set(
            genres.filter(
                Boolean
            )
        ),
    ];
};


// ============================================================
// LANGUAGE
// ============================================================

const getMovieLanguage = (
    movie
) => {

    return normalizeText(
        movie?.original_language
    );
};


// ============================================================
// RUNTIME
// ============================================================

const getMovieRuntime = (
    movie
) => {

    const runtime =
        Number(
            movie?.runtime
        );


    if (
        !Number.isFinite(
            runtime
        ) ||
        runtime <= 0
    ) {
        return null;
    }


    return runtime;
};


// ============================================================
// SCORE
// ============================================================

export const scoreMovieForVibe = (
    movie,
    vibe
) => {

    let score = 0;

    const matchedReasons = [];


    const movieGenres =
        getMovieGenres(
            movie
        );


    const movieLanguage =
        getMovieLanguage(
            movie
        );


    const movieRuntime =
        getMovieRuntime(
            movie
        );


    // --------------------------------------------------------
    // GENRE
    // --------------------------------------------------------

    vibe.genres.forEach(
        (genre) => {

            const normalized =
                normalizeText(
                    genre
                );


            if (
                movieGenres.includes(
                    normalized
                )
            ) {

                score += 30;

                matchedReasons.push(
                    genre
                );
            }
        }
    );


    // --------------------------------------------------------
    // LANGUAGE
    // --------------------------------------------------------

    if (
        vibe.language &&
        movieLanguage ===
            vibe.language
    ) {

        score += 15;

        matchedReasons.push(
            vibe.language
        );
    }


    // --------------------------------------------------------
    // RUNTIME
    // --------------------------------------------------------

    if (
        movieRuntime !== null
    ) {

        if (
            vibe.maxRuntime !==
            null
        ) {

            if (
                movieRuntime <=
                vibe.maxRuntime
            ) {

                score += 20;

                matchedReasons.push(
                    "runtime"
                );

            } else {

                score -= 15;
            }
        }


        if (
            vibe.minRuntime !==
            null
        ) {

            if (
                movieRuntime >=
                vibe.minRuntime
            ) {

                score += 15;

                matchedReasons.push(
                    "runtime"
                );
            }
        }
    }


    // --------------------------------------------------------
    // RATING
    // --------------------------------------------------------

    const rating =
        Number(
            movie?.vote_average
        ) || 0;


    if (
        vibe.minRating !==
        null
    ) {

        if (
            rating >=
            vibe.minRating
        ) {

            score += 15;

            matchedReasons.push(
                "rating"
            );

        } else {

            score -= 10;
        }

    } else {

        if (
            rating >= 8
        ) {

            score += 10;

        } else if (
            rating >= 7
        ) {

            score += 6;

        } else if (
            rating >= 6
        ) {

            score += 3;
        }
    }


    return {
        score:
            Math.max(
                0,
                score
            ),

        matchedReasons: [
            ...new Set(
                matchedReasons
            ),
        ],
    };
};


// ============================================================
// RANK
// ============================================================

export const rankMoviesByVibe =
    (
        movies,
        vibe
    ) => {

        if (
            !Array.isArray(
                movies
            )
        ) {
            return [];
        }


        return movies
            .map(
                (movie) => {

                    const result =
                        scoreMovieForVibe(
                            movie,
                            vibe
                        );


                    return {
                        movie,

                        score:
                            result.score,

                        matchedReasons:
                            result.matchedReasons,
                    };
                }
            )
            .sort(
                (a, b) =>
                    b.score -
                    a.score
            );
    };


// ============================================================
// FINAL VIBE MATCHES
// ============================================================

export const getVibeMatches =
    (
        movies,
        prompt
    ) => {

        const vibe =
            parseMovieVibe(
                prompt
            );


        const ranked =
            rankMoviesByVibe(
                movies,
                vibe
            );


        return {
            vibe,
            ranked,
        };
    };