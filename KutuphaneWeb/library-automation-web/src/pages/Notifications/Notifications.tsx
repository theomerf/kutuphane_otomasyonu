import { useEffect, useReducer, useState } from "react"
import requests from "../../services/api";
import { ClipLoader } from "react-spinners";
import type Notification from "../../types/notification";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faCalendarAlt, faCheck, faCheckDouble, faQuestion, faTrash, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import BackendDataReducer from "../../types/backendDataList";
import { useBreakpoint } from "../../hooks/useBreakpoint";

export default function Notifications() {
    const [notifications, dispatch] = useReducer(BackendDataReducer<Notification>, {
        data: null,
        isLoading: false,
        error: null
    });
    const [refreshNotifications, setRefreshNotifications] = useState(0);
    const { up } = useBreakpoint();

    const fetchNotifications = async (signal: AbortSignal) => {
        dispatch({ type: "FETCH_START" });
        try {
            const result = await requests.notifications.getAllNotificationsOfOneUser(signal);
            dispatch({ type: "FETCH_SUCCESS", payload: result.data as Notification[] });
        }
        catch (error: any) {
            if (error.name === "CanceledError" || error.name === "AbortError") {
                return;
            }
            else {
                dispatch({ type: "FETCH_ERROR", payload: error.message || "Bildirimler yüklenirken bir hata oluştu." });
            }
        }
    };

    const handleMarkAsRead = async (id: number) => {
        try {
            await requests.notifications.markAsRead(id);
            toast.success("Bildirim okundu olarak işaretlendi.");
            setRefreshNotifications(prev => prev + 1);
        }
        catch (error) {
            toast.error("Bildirim okundu olarak işaretlenirken bir hata oluştu.");
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await requests.notifications.markAllAsReadOfOneUser();
            toast.success("Tüm bildirimler okundu olarak işaretlendi.");
            setRefreshNotifications(prev => prev + 1);
        }
        catch (error) {
            toast.error("Tüm bildirimler okundu olarak işaretlenirken bir hata oluştu.");
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await requests.notifications.deleteNotificationForUser(id);
            toast.success("Bildirim başarıyla silindi.");
            setRefreshNotifications(prev => prev + 1);
        }
        catch (error) {
            toast.error("Bildirim silinirken bir hata oluştu.");
        }
    };

    const handleDeleteAll = async () => {
        try {
            await requests.notifications.deleteAllNotificationsOfOneUser();
            toast.success("Tüm bildirimler başarıyla silindi.");
            setRefreshNotifications(prev => prev + 1);
        }
        catch (error) {
            toast.error("Tüm bildirimler silinirken bir hata oluştu.");
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        fetchNotifications(controller.signal);

        return () => {
            controller.abort();
        };
    }, [refreshNotifications]);

    return (
        <div className="flex flex-col">
            <div className="flex flex-row mx-8 lg:mx-20">
                <p className="font-semibold text-4xl text-violet-500 h-fit border-none pb-2 mb-8 relative after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-20 after:h-1 after:bg-hero-gradient after:rounded-sm">Bildirimler</p>
                <div className="ml-auto flex flex-row self-center justify-end gap-x-2 mb-2">
                    <button type="button" onClick={handleMarkAllAsRead} title="Tümünü okundu olarak işaretle" className="bg-green-500 rounded-lg text-center flex justify-center content-center align-middle text-white w-10 h-10 hover:scale-105 hover:bg-green-600 duration-500 text-lg">
                        <FontAwesomeIcon icon={faCheckDouble} className="self-center" />
                    </button>
                    <button type="button" onClick={handleDeleteAll} title="Tümünü sil" className="bg-red-500 rounded-lg text-center flex justify-center content-center align-middle text-white w-10 h-10 hover:scale-105 hover:bg-red-600 duration-500 text-lg">
                        <FontAwesomeIcon icon={faTrashCan} className="self-center" />
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-y-4 border-gray-200 border shadow-lg mx-4 lg:mx-20 px-2 lg:px-4 py-6 rounded-lg bg-white">
                {(notifications.isLoading) && (
                    <div className="flex justify-center items-center h-64">
                        <ClipLoader size={40} color="#8B5CF6" />
                    </div>
                )}

                {notifications.error && (
                    <div className="flex justify-center items-center h-64 text-red-500">
                        <p>{notifications.error}</p>
                    </div>
                )}

                {(!notifications.isLoading && !notifications.error && notifications.data && notifications.data.length === 0) && (
                    <div className="flex flex-col gap-y-6 justify-center items-center h-64 ">
                        <FontAwesomeIcon icon={faQuestion} className="text-5xl text-violet-400 animate-pulse" />
                        <p className="text-gray-500 text-2xl">Henüz bildiriminiz yok.</p>
                    </div>
                )}

                {(!notifications.isLoading && !notifications.error && notifications.data && notifications.data.length > 0) && (
                    <>
                        {notifications.data.map((notification) => (
                            <div key={notification.id} className={`flex flex-col relative gap-y-4 border border-gray-200 px-6 py-4 rounded-md hover:shadow-md hover:scale-[101%] transition-all duration-500 ${notification.isRead ? 'bg-gray-400' : notification.type === 'Info' ? 'bg-green-400' : notification.type === 'Warning' ? 'bg-yellow-400' : 'bg-red-400'}`}>
                                <div className="absolute top-[-4px] left-[-4px] w-5 h-5 rounded-full bg-violet-400"></div>
                                <div className="flex :flex-row justify-between lg:items-center">
                                    {up.lg ? (
                                        <>
                                            <p className="text-base lg:text-2xl text-white font-semibold">
                                                <FontAwesomeIcon icon={faBell} className="mr-2" />
                                                {notification.title}
                                            </p>
                                            <span className="text-sm lg:text-base font-semibold text-white">
                                                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                                                {new Date(notification.createdAt || "").toLocaleString()}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex flex-col">
                                                <p className="text-base lg:text-2xl text-white font-semibold">
                                                    <FontAwesomeIcon icon={faBell} className="mr-2" />
                                                    {notification.title}
                                                </p>
                                                <span className="text-sm lg:text-base font-semibold text-white">
                                                    <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                                                    {new Date(notification.createdAt || "").toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex flex-row ml-auto gap-x-2 h-fit">
                                                {!notification.isRead &&
                                                    <button type="button" onClick={() => handleMarkAsRead(notification.id!)} title="Okundu olarak işaretle" className="bg-green-600 rounded-lg text-center flex justify-center content-center align-middle text-white p-2 lg:w-10 lg:h-10 hover:scale-105 hover:bg-green-700 duration-500 text-lg">
                                                        <FontAwesomeIcon icon={faCheck} className="self-center text-sm" />
                                                    </button>
                                                }
                                                <button type="button" onClick={() => handleDelete(notification.id!)} title="Sil" className="bg-red-500 rounded-lg text-center flex justify-center content-center align-middle text-white p-2 lg:w-10 lg:h-10 hover:scale-105 hover:bg-red-600 duration-500 text-lg">
                                                    <FontAwesomeIcon icon={faTrash} className="self-center text-sm" />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="flex flex-row">
                                    <p className="text-sm lg:text-base text-white font-semibold">{notification.message}</p>
                                    {up.lg &&
                                        <div className="flex flex-row ml-auto gap-x-2">
                                            {!notification.isRead &&
                                                <button type="button" onClick={() => handleMarkAsRead(notification.id!)} title="Okundu olarak işaretle" className="bg-green-600 rounded-lg text-center flex justify-center content-center align-middle text-white w-10 h-10 hover:scale-105 hover:bg-green-700 duration-500 text-lg">
                                                    <FontAwesomeIcon icon={faCheck} className="self-center" />
                                                </button>
                                            }
                                            <button type="button" onClick={() => handleDelete(notification.id!)} title="Sil" className="bg-red-500 rounded-lg text-center flex justify-center content-center align-middle text-white w-10 h-10 hover:scale-105 hover:bg-red-600 duration-500 text-lg">
                                                <FontAwesomeIcon icon={faTrash} className="self-center" />
                                            </button>
                                        </div>}
                                </div>

                            </div>
                        ))}
                    </>
                )
                }
            </div>
        </div>
    )
}