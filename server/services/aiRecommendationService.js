import {
    GoogleGenAI,
} from "@google/genai";


// ============================================================
// GEMINI CLIENT
// ============================================================

const getGeminiClient = () => {
    const apiKey =
        process.env.GEMINI_API_KEY;

    if (
        !apiKey ||
        !apiKey.trim()
    ) {
        throw new Error(
            "GEMINI_API_KEY is not configured on the server."
        );
    }

    return new GoogleGenAI({
        apiKey,
    });
};


// ============================================================
// MODELS
// ============================================================

const getGeminiModels = () => {
    const primaryModel =
        process.env.GEMINI_MODEL ||
        "gemini-3.8-flash";

    const fallbackModels = (
        process.env.GEMINI_FALLBACK_MODELS ||
        ""
    )
        .split(",")
        .map(
            (model) =>
                model.trim()
        )
        .filter(Boolean);

    const models = [
        primaryModel,
        ...fallbackModels,
    ];

    return [
        ...new Set(
            models
        ),
    ];
};


// ============================================================
// RETRY SETTINGS
// ============================================================

const MAX_RETRIES =
    Number(
        process.env.GEMINI_MAX_RETRIES
    ) || 2;


const RETRY_DELAY_MS =
    Number(
        process.env.GEMINI_RETRY_DELAY_MS
    ) || 1500;


// ============================================================
// WAIT
// ============================================================

const sleep = (
    milliseconds
) =>
    new Promise(
        (resolve) =>
            setTimeout(
                resolve,
                milliseconds
            )
    );


// ============================================================
// ERROR HELPERS
// ============================================================

const getErrorStatus = (
    error
) => {
    if (
        error?.status
    ) {
        return Number(
            error.status
        );
    }

    if (
        error?.code
    ) {
        return Number(
            error.code
        );
    }

    return null;
};


const isRetryableError = (
    error
) => {
    const status =
        getErrorStatus(
            error
        );

    return [
        429,
        500,
        502,
        503,
        504,
    ].includes(
        status
    );
};


const getErrorMessage = (
    error
) => {
    if (
        typeof error?.message ===
        "string"
    ) {
        return error.message;
    }

    try {
        return JSON.stringify(
            error
        );
    } catch {
        return "Unknown Gemini error.";
    }
};


// ============================================================
// GEMINI REQUEST WITH RETRY
// ============================================================

const generateGeminiContent =
    async ({
        ai,
        models,
        contents,
        config,
    }) => {

        let lastError =
            null;


        for (
            let modelIndex = 0;
            modelIndex <
            models.length;
            modelIndex++
        ) {

            const model =
                models[
                    modelIndex
                ];


            console.log(
                `GenZ AI trying model: ${model}`
            );


            for (
                let attempt = 0;
                attempt <=
                MAX_RETRIES;
                attempt++
            ) {

                try {

                    const response =
                        await ai.models.generateContent(
                            {
                                model,

                                contents,

                                config,
                            }
                        );


                    console.log(
                        `GenZ AI success using model: ${model}`
                    );


                    return response;

                } catch (
                    error
                ) {

                    lastError =
                        error;


                    const status =
                        getErrorStatus(
                            error
                        );


                    console.error(
                        `Gemini error | model=${model} | attempt=${attempt + 1} | status=${status}`
                    );


                    console.error(
                        getErrorMessage(
                            error
                        )
                    );


                    if (
                        !isRetryableError(
                            error
                        )
                    ) {
                        throw error;
                    }


                    if (
                        attempt <
                        MAX_RETRIES
                    ) {

                        const delay =
                            RETRY_DELAY_MS *
                            Math.pow(
                                2,
                                attempt
                            );


                        console.log(
                            `Retrying Gemini in ${delay}ms...`
                        );


                        await sleep(
                            delay
                        );
                    }
                }
            }


            if (
                modelIndex <
                models.length - 1
            ) {

                console.log(
                    `Primary Gemini model unavailable. Switching to fallback model: ${
                        models[
                            modelIndex + 1
                        ]
                    }`
                );
            }
        }


        throw (
            lastError ||
            new Error(
                "All Gemini models failed."
            )
        );
    };


// ============================================================
// JSON CLEANER
// ============================================================

const cleanJsonText = (
    text
) => {

    if (!text) {
        return "";
    }


    return text
        .replace(
            /^```json\s*/i,
            ""
        )
        .replace(
            /^```\s*/i,
            ""
        )
        .replace(
            /\s*```$/i,
            ""
        )
        .trim();
};


// ============================================================
// JSON PARSER
// ============================================================

const parseRecommendationJSON = (
    text
) => {

    const cleaned =
        cleanJsonText(
            text
        );


    if (
        !cleaned
    ) {
        throw new Error(
            "Gemini returned an empty response."
        );
    }


    try {

        return JSON.parse(
            cleaned
        );

    } catch (
        error
    ) {

        console.error(
            "GEMINI JSON PARSE ERROR:"
        );

        console.error(
            cleaned
        );


        throw new Error(
            "AI returned an invalid recommendation response."
        );
    }
};


// ============================================================
// AI MOVIE UNDERSTANDING
// ============================================================

export const understandMovieRequest =
    async ({
        prompt,
        movies,
    }) => {

        if (
            !prompt ||
            !prompt.trim()
        ) {

            throw new Error(
                "Movie recommendation prompt is required."
            );
        }


        if (
            !Array.isArray(
                movies
            ) ||
            movies.length === 0
        ) {

            return {
                movieIds: [],

                reason:
                    "There are no movies available right now.",
            };
        }


        // ----------------------------------------------------
        // CREATE COMPACT CATALOGUE
        // ----------------------------------------------------

        const movieCatalogue =
            movies.map(
                (movie) => ({
                    id: String(
                        movie._id
                    ),

                    title:
                        movie.title ||
                        "",

                    overview:
                        movie.overview ||
                        "",

                    genres:
                        Array.isArray(
                            movie.genres
                        )
                            ? movie.genres.map(
                                (
                                    genre
                                ) => {

                                    if (
                                        typeof genre ===
                                            "object" &&
                                        genre !==
                                            null
                                    ) {

                                        return (
                                            genre.name ||
                                            genre.id ||
                                            ""
                                        );
                                    }

                                    return genre;
                                }
                            )
                            : [],

                    runtime:
                        Number(
                            movie.runtime
                        ) || null,

                    rating:
                        Number(
                            movie.vote_average
                        ) || 0,

                    language:
                        movie.original_language ||
                        "",

                    release_date:
                        movie.release_date ||
                        "",
                })
            );


        // ----------------------------------------------------
        // SYSTEM INSTRUCTION
        // ----------------------------------------------------

        const systemInstruction = `
You are GenZShow AI, a movie recommendation assistant.

Your job is to understand what the user wants to watch
and select movies ONLY from the supplied GenZShow catalogue.

NEVER invent a movie.

NEVER return a movie that is not present in the catalogue.

The user can describe:

- mood
- genre
- runtime
- rating
- language
- solo watching
- friends
- family
- date night
- romance
- comedy
- action
- horror
- thriller
- emotional
- relaxing
- mind-bending
- intense
- fun
- late-night watching

Return ONLY valid JSON.

The JSON must have exactly this structure:

{
    "movieIds": [
        "id1",
        "id2",
        "id3"
    ],
    "reason": "Short explanation."
}

Rules:

1. Return at most 3 movie IDs.

2. Use IDs EXACTLY as provided.

3. Never create an ID.

4. Never recommend a movie outside the catalogue.

5. If there are no reasonable matches,
   return an empty movieIds array.

6. Keep reason under 250 characters.

7. Do not use Markdown.

8. Do not wrap the JSON in backticks.

9. Prefer the strongest matches first.

10. Only use information contained in the catalogue.
`;


        // ----------------------------------------------------
        // USER PROMPT
        // ----------------------------------------------------

        const userPrompt = `
USER REQUEST:

${prompt.trim()}


GENZSHOW MOVIE CATALOGUE:

${JSON.stringify(
    movieCatalogue
)}
`;


        // ----------------------------------------------------
        // GEMINI
        // ----------------------------------------------------

        const ai =
            getGeminiClient();


        const models =
            getGeminiModels();


        console.log(
            "GenZ AI models:",
            models
        );


        const response =
            await generateGeminiContent(
                {
                    ai,

                    models,

                    contents:
                        userPrompt,

                    config: {
                        systemInstruction,

                        temperature:
                            0.2,

                        responseMimeType:
                            "application/json",

                        maxOutputTokens:
                            500,
                    },
                }
            );


        // ----------------------------------------------------
        // RESPONSE TEXT
        // ----------------------------------------------------

        const text =
            response?.text ||
            "";


        // ----------------------------------------------------
        // PARSE JSON
        // ----------------------------------------------------

        const parsed =
            parseRecommendationJSON(
                text
            );


        // ----------------------------------------------------
        // NORMALIZE IDS
        // ----------------------------------------------------

        const movieIds =
            Array.isArray(
                parsed?.movieIds
            )
                ? parsed.movieIds
                    .map(
                        (
                            id
                        ) =>
                            String(
                                id
                            ).trim()
                    )
                    .filter(Boolean)
                    .slice(
                        0,
                        3
                    )
                : [];


        // ----------------------------------------------------
        // IMPORTANT:
        // ONLY ALLOW IDS FROM CATALOGUE
        // ----------------------------------------------------

        const validMovieIds =
            new Set(
                movieCatalogue.map(
                    (movie) =>
                        String(
                            movie.id
                        )
                )
            );


        const safeMovieIds =
            movieIds.filter(
                (id) =>
                    validMovieIds.has(
                        id
                    )
            );


        // ----------------------------------------------------
        // REASON
        // ----------------------------------------------------

        const reason =
            typeof parsed?.reason ===
            "string"
                ? parsed.reason
                    .trim()
                    .slice(
                        0,
                        250
                    )
                : "These movies match your request.";


        return {
            movieIds:
                safeMovieIds,

            reason,
        };
    };


// ============================================================
// FINAL RECOMMENDATIONS
// ============================================================

export const getAIRecommendations =
    async ({
        prompt,
        movies,
    }) => {

        if (
            !prompt ||
            !prompt.trim()
        ) {

            throw new Error(
                "Movie recommendation prompt is required."
            );
        }


        if (
            !Array.isArray(
                movies
            ) ||
            movies.length === 0
        ) {

            return {
                movies: [],

                reason:
                    "There are no movies available in the GenZShow catalogue right now.",
            };
        }


        const aiResult =
            await understandMovieRequest(
                {
                    prompt,
                    movies,
                }
            );


        // ----------------------------------------------------
        // MOVIE MAP
        // ----------------------------------------------------

        const movieMap =
            new Map();


        movies.forEach(
            (movie) => {

                movieMap.set(
                    String(
                        movie._id
                    ),

                    movie
                );
            }
        );


        // ----------------------------------------------------
        // PRESERVE AI ORDER
        // ----------------------------------------------------

        const orderedMovies =
            aiResult.movieIds
                .map(
                    (id) =>
                        movieMap.get(
                            String(
                                id
                            )
                        )
                )
                .filter(
                    Boolean
                )
                .slice(
                    0,
                    3
                );


        // ----------------------------------------------------
        // FINAL RESULT
        // ----------------------------------------------------

        return {
            movies:
                orderedMovies,

            reason:
                aiResult.reason,
        };
    };


// ============================================================
// ERROR EXPORT
// ============================================================

export const isGeminiTemporaryError =
    (
        error
    ) => {

        return isRetryableError(
            error
        );
    };