import { useState, useCallback } from "react";
import { totemsApi } from "../api/totems"

export function useTotems() {
    const [totems, setTotems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadTotems = useCallback(async () => {
        setLoading(true);
        try {
            const response = await totemsApi.getAll();
            setTotems(response.data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const createTotem = useCallback(async (totemData) => {
        setLoading(true);
        try {
            const response = await totemsApi.create(totemData);
            setTotems(prev => [...prev, response.data]);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateTotem = useCallback(async (id, totemData) => {
        setLoading(true);
        try {
            const response = await totemsApi.update(id, totemData);
            setTotems(prev => prev.map(totem => totem.id === id ? response.data : totem));
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const toggleTotemStatus = useCallback(async (id) => {
        setLoading(true);
        try {
            await totemsApi.toggleStatus(id);
            setTotems(prev => prev.map(totem => totem.id === id ? { ...totem, active: !totem.active } : totem));
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteTotem = useCallback(async (id) => {
        setLoading(true);
        try {
            await totemsApi.delete(id);
            setTotems(prev => prev.filter(totem => totem.id !== id));
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const getApiKey = useCallback(async (id) => {
        setLoading(true);
        try {
            const response = await totemsApi.getApiKey(id);
            return response.data.apiKey;
        } catch (err) {
            setError(err);
            return null;
        } finally {
            setLoading(false);
        } 
    }, []);

    const regenerateApiKey = useCallback(async (id) => {
        setLoading(true);
        try {
            const response = await totemsApi.regenerateApiKey(id);
            return response.data.apiKey;
        } catch (err) {
            setError(err);
            return null;
        } finally {
            setLoading(false);
        } 
    }, []);

    return {
        // Estado
        totems,
        loading,
        error,

        // Ações
        loadTotems,
        createTotem,
        updateTotem,
        toggleTotemStatus,
        deleteTotem,
        getApiKey,
        regenerateApiKey,

    }
}