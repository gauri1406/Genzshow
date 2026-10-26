import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import axios from "axios";

import {
    useAuth,
    useUser,
} from "@clerk/clerk-react";

import {
    useLocation,
    useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";


/* =====================================================
   API CONFIG
===================================================== */

const API_BASE_URL =
    import.meta.env.VITE_BASE_URL ||
    "http://localhost:3000";


/* =====================================================
   AXIOS INSTANCE
===================================================== */

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
});


/* =====================================================
   CONTEXT
===================================================== */

export const AppContext =
    createContext();


/* =====================================================
   PROVIDER
===================================================== */

export const AppProvider = ({
    children,
}) => {

    const [
        isAdmin,
        setIsAdmin,
    ] = useState(false);

    const [
        shows,
        setShows,
    ] = useState([]);

    const [
        favoriteMovies,
        setFavoriteMovies,
    ] = useState([]);

    const [
        isShowsLoading,
        setIsShowsLoading,
    ] = useState(true);


    /* =================================================
       ENV
    ================================================= */

    const image_base_url =
        import.meta.env
            .VITE_TMDB_IMAGE_BASE_URL;


    /* =================================================
       CLERK
    ================================================= */

    const { user } =
        useUser();

    const {
        getToken,
        isLoaded: isAuthLoaded,
        isSignedIn,
    } = useAuth();


    /* =================================================
       ROUTER
    ================================================= */

    const location =
        useLocation();

    const navigate =
        useNavigate();


    /* =================================================
       AXIOS CLERK INTERCEPTOR
    ================================================= */

    useEffect(() => {

        const interceptor =
            api.interceptors.request.use(
                async (config) => {

                    try {

                        const token =
                            await getToken();

                        if (token) {

                            config.headers =
                                config.headers ||
                                {};

                            config.headers.Authorization =
                                `Bearer ${token}`;
                        }

                    } catch (error) {

                        console.error(
                            "CLERK TOKEN ERROR:",
                            error
                        );
                    }

                    return config;
                },

                (error) => {
                    return Promise.reject(
                        error
                    );
                }
            );


        return () => {

            api.interceptors.request.eject(
                interceptor
            );

        };

    }, [getToken]);


    /* =================================================
       CHECK ADMIN
    ================================================= */

    const fetchIsAdmin =
        async () => {

            try {

                if (!isAuthLoaded) {
                    return;
                }

                if (!isSignedIn) {

                    setIsAdmin(false);

                    return;
                }


                const {
                    data,
                } = await api.get(
                    "/api/admin/is-admin"
                );


                setIsAdmin(
                    Boolean(
                        data?.isAdmin
                    )
                );


                if (
                    !data?.isAdmin &&
                    location.pathname.startsWith(
                        "/admin"
                    )
                ) {

                    navigate("/");

                    toast.error(
                        "You are not authorized to access admin dashboard"
                    );
                }

            } catch (error) {

                console.error(
                    "FETCH ADMIN ERROR:",
                    error?.response?.data ||
                        error
                );

                setIsAdmin(false);
            }
        };


    /* =================================================
       FETCH SHOWS
    ================================================= */

    const fetchShows =
        async () => {

            try {

                setIsShowsLoading(
                    true
                );


                const {
                    data,
                } = await api.get(
                    "/api/show"
                );


                if (
                    data?.success
                ) {

                    const movies =
                        Array.isArray(
                            data.shows
                        )
                            ? data.shows
                            : [];


                    setShows(
                        movies
                    );

                } else {

                    setShows([]);

                    console.error(
                        "SHOW FETCH ERROR:",
                        data?.message
                    );
                }

            } catch (error) {

                console.error(
                    "FETCH SHOWS ERROR:",
                    error?.response?.data ||
                        error
                );

                setShows([]);

            } finally {

                setIsShowsLoading(
                    false
                );
            }
        };


    /* =================================================
       FETCH FAVORITES
    ================================================= */

    const fetchFavoriteMovies =
        async () => {

            try {

                if (!isAuthLoaded) {
                    return;
                }


                if (!isSignedIn) {

                    setFavoriteMovies(
                        []
                    );

                    return;
                }


                const {
                    data,
                } = await api.get(
                    "/api/user/favorites"
                );


                if (
                    data?.success
                ) {

                    setFavoriteMovies(
                        Array.isArray(
                            data.movies
                        )
                            ? data.movies
                            : []
                    );

                } else {

                    setFavoriteMovies(
                        []
                    );
                }

            } catch (error) {

                console.error(
                    "FETCH FAVORITES ERROR:",
                    error?.response?.data ||
                        error
                );

                setFavoriteMovies(
                    []
                );
            }
        };


    /* =================================================
       INITIAL SHOW FETCH
    ================================================= */

    useEffect(() => {

        fetchShows();

    }, []);


    /* =================================================
       USER AUTH CHANGES
    ================================================= */

    useEffect(() => {

        if (!isAuthLoaded) {
            return;
        }


        if (
            !user ||
            !isSignedIn
        ) {

            setFavoriteMovies(
                []
            );

            setIsAdmin(false);

            return;
        }


        fetchIsAdmin();

        fetchFavoriteMovies();

    }, [
        user,
        isSignedIn,
        isAuthLoaded,
    ]);


    /* =================================================
       CONTEXT VALUE
    ================================================= */

    const value =
        useMemo(
            () => {

                return {

                    axios: api,

                    user,

                    getToken,

                    isSignedIn,

                    isAuthLoaded,

                    navigate,

                    isAdmin,

                    fetchIsAdmin,

                    shows,

                    setShows,

                    fetchShows,

                    isShowsLoading,

                    favoriteMovies,

                    setFavoriteMovies,

                    fetchFavoriteMovies,

                    image_base_url,

                };

            },
            [
                user,
                getToken,
                isSignedIn,
                isAuthLoaded,
                navigate,
                isAdmin,
                shows,
                favoriteMovies,
                isShowsLoading,
                image_base_url,
            ]
        );


    /* =================================================
       PROVIDER
    ================================================= */

    return (
        <AppContext.Provider
            value={value}
        >
            {children}
        </AppContext.Provider>
    );
};


/* =====================================================
   HOOK
===================================================== */

export const useAppContext =
    () =>
        useContext(
            AppContext
        );