import { useEffect, useState } from "react"
import type BackendData from "../../types/backendData"
import requests from "../../services/api";
import { ClipLoader } from "react-spinners";
import type Notification from "../../types/notification";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCheckDouble, faQuestion, faTrash, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

export default function Notifications() {
    const [notifications, setNotifications] = useState<BackendData<Notification>>({
        data: [] as Notification[],
        isLoading: false,
        error: null
    });

    const fetchNotifications = async () => {
        try {
            setNotifications({ ...notifications, isLoading: true });

            const result = await requests.notifications.getAllNotificationsOfOneUser();
            setNotifications({ data: result.data as Notification[], isLoading: false, error: null });
        }
        catch (error: any) {
            setNotifications({ data: null, isLoading: false, error: error.message });
        }
        finally {
            setNotifications({ ...notifications, isLoading: false });
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [])

    const handleMarkAsRead = async (id: number) => {
        try {
            await requests.notifications.markAsRead(id);
            fetchNotifications();
        }
        catch (error) {
            toast.error("Bildirim okundu olarak işaretlenirken bir hata oluştu.");
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await requests.notifications.markAllAsReadOfOneUser();
            fetchNotifications();
        }
        catch (error) {
            toast.error("Tüm bildirimler okundu olarak işaretlenirken bir hata oluştu.");
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await requests.notifications.deleteNotificationForUser(id);
            fetchNotifications();
        }
        catch (error) {
            toast.error("Bildirim silinirken bir hata oluştu.");
        }
    };

    const handleDeleteAll = async () => {
        try {
            await requests.notifications.deleteAllNotificationsOfOneUser();
            fetchNotifications();
        }
        catch (error) {
            toast.error("Tüm bildirimler silinirken bir hata oluştu.");
        }
    };

    return (
        <div className="flex flex-col">
            <p className="font-semibold text-4xl ml-8 lg:ml-20 text-violet-500 h-fit border-none pb-2 mb-8 relative after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-20 after:h-1 after:bg-hero-gradient after:rounded-sm">Bildirimler</p>
            <div className="flex flex-col gap-y-4 border-gray-200 border shadow-lg mx-20 px-4 py-6 rounded-lg bg-white">
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
                        <FontAwesomeIcon icon={faQuestion} className="text-5xl text-violet-400 animate-pulse"/>
                        <p className="text-gray-500 text-2xl">Henüz bildiriminiz yok.</p>
                    </div>
                )}

                {(!notifications.isLoading && !notifications.error && notifications.data && notifications.data.length > 0) && (
                    <>
                        <div className="flex flex-row justify-end gap-x-2 mb-2">
                            <button type="button" onClick={handleMarkAllAsRead} title="Tümünü okundu olarak işaretle" className="bg-green-500 rounded-lg text-center flex justify-center content-center align-middle text-white w-10 h-10 hover:scale-105 hover:bg-green-600 duration-500 text-lg">
                                <FontAwesomeIcon icon={faCheckDouble} />
                            </button>
                            <button type="button" onClick={handleDeleteAll} title="Tümünü sil" className="bg-red-500 rounded-lg text-center flex justify-center content-center align-middle text-white w-10 h-10 hover:scale-105 hover:bg-red-600 duration-500 text-lg">
                                <FontAwesomeIcon icon={faTrashCan} />
                            </button>
                        </div>
                        {notifications.data.map((notification) => (
                            <div key={notification.id} className={`flex flex-col gap-y-2 border border-gray-200 px-4 py-2 rounded-md hover:shadow-md transition-shadow duration-200 ${notification.isRead ? 'bg-gray-400' : 'bg-white'}`}>
                                <div className="flex flex-row justify-between items-center">
                                    <h3 className="text-lg font-semibold">{notification.title}</h3>
                                    <span className="text-sm text-gray-500">{new Date(notification.createdAt || "").toLocaleString()}</span>
                                </div>
                                <div className="flex flex-row">
                                    <p className="text-gray-700">{notification.message}</p>
                                    <div className="flex flex-row ml-auto gap-x-2">
                                        {!notification.isRead &&
                                            <button type="button" onClick={() => handleMarkAsRead(notification.id!)} title="Okundu olarak işaretle" className="bg-green-500 rounded-lg text-center flex justify-center content-center align-middle text-white w-10 h-10 hover:scale-105 hover:bg-green-600 duration-500 text-lg">
                                                <FontAwesomeIcon icon={faCheck} />
                                            </button>
                                        }
                                        <button type="button" onClick={() => handleDelete(notification.id!)} title="Sil" className="bg-red-500 rounded-lg text-center flex justify-center content-center align-middle text-white w-10 h-10 hover:scale-105 hover:bg-red-600 duration-500 text-lg">
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
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