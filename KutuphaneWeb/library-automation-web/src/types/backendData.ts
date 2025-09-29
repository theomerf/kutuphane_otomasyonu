export default interface BackendData<T> {
    data: T[] | null;
    isLoading: boolean;
    error: any | null;
}

