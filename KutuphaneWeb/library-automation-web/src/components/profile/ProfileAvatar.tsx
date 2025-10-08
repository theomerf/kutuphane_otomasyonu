import { faCameraAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useForm } from "react-hook-form";
import type { BackendDataObject } from "../../types/backendDataObject";
import type Account from "../../types/account";
import requests from "../../services/api";
import { toast } from "react-toastify";

type Props = {
    userDetails: BackendDataObject<Account>
    setRefreshUserDetails: React.Dispatch<React.SetStateAction<number>>;
}

export default function ProfileAvatar({ userDetails, setRefreshUserDetails }: Props) {
    const { register, handleSubmit } = useForm();

    const { onChange, ...rest } = register("NewImage");
    const handleAvatarUpdate = async (data: any) => {
        const file = data.NewImage?.[0];
        if (!file) {
            toast.error("Lütfen bir dosya seçin.");
            return;
        }

        const formData = new FormData();
        formData.append("NewImage", file);

        try {
            await requests.account.updateAvatar(formData);
            setRefreshUserDetails(prev => prev + 1);
            toast.success("Profil fotoğrafı başarıyla güncellendi.");
        }
        catch (error: any) {
            console.error("Profil fotoğrafı güncellenirken hata:", error);
            toast.error("Profil fotoğrafı güncellenirken bir hata oluştu.");
        }
    };

    return (
        <div className="h-40 w-40 lg:h-60 lg:w-60 self-center rounded-full relative shadow-md border border-violet-400">
            <img 
                src={userDetails.data?.avatarUrl?.includes("avatars") ? "https://localhost:7214/images/" + userDetails.data?.avatarUrl : userDetails.data?.avatarUrl} 
                className="w-full h-full rounded-full object-cover hover:scale-[102%] duration-500" 
            />
            <input 
                type="file" 
                {...register("NewImage")} 
                {...rest}
                onChange={(e) => {
                    onChange(e);
                    handleSubmit(handleAvatarUpdate)();
                }} 
                accept="image/*" 
                id="avatarUpload" 
                title="Fotoğraf Yükle" 
                className="hidden"
            />
            <label 
                htmlFor="avatarUpload" 
                className="absolute right-2 bottom-2 lg:right-5 lg:bottom-0 bg-violet-400 rounded-full text-center flex justify-center content-center align-middle text-white w-8 h-8 lg:w-10 lg:h-10 hover:scale-110 hover:bg-violet-500 duration-500 text-sm lg:text-base cursor-pointer shadow-lg"
            >
                <FontAwesomeIcon icon={faCameraAlt} className="self-center" />
            </label>
        </div>
    );
}