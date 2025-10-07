import { useEffect, useReducer } from 'react';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar, type BarDatum } from '@nivo/bar';
import { transformToNivoData } from '../../utils/chartDataTransformer';
import requests from '../../services/api';
import BackendDataListReducer from '../../types/backendDataList';
import { ClipLoader } from 'react-spinners';

interface PieData {
    id: string;
    label: string;
    value: number;
}

interface HistogramData extends BarDatum {
    day: string;
    count: number;
    color?: string;
    [key: string]: any;
}

export default function DashboardGraphs() {
    const [loanStats, loanDispatch] = useReducer(BackendDataListReducer<PieData>, {
        data: null,
        isLoading: false,
        error: null
    });

    const [reservationStats, reservationDispatch] = useReducer(BackendDataListReducer<HistogramData>, {
        data: null,
        isLoading: false,
        error: null
    });

    useEffect(() => {
        const controller = new AbortController();

        fetchLoanStats(controller.signal);
        fetchReservationStats(controller.signal);

        return () => {
            controller.abort();
        };
    }, []);

    const fetchLoanStats = async (signal: AbortSignal) => {
        loanDispatch({ type: "FETCH_START" });
        try {
            const response = await requests.admin.getLoanStats(signal);
            const transformedData: PieData[] = transformToNivoData(response.data);
            loanDispatch({ type: "FETCH_SUCCESS", payload: transformedData });
        }
        catch (error: any) {
            if (error.name === "CanceledError" || error.name === "AbortError") {
                return;
            }
            else {
                loanDispatch({ type: "FETCH_ERROR", payload: error.message || "Kiralama istatistikleri çekilirken hata oluştu." });
            }
        }
    };

    const getColorByCount = (count: number): string => {
        if (count === 0) return '#e5e7eb';
        if (count <= 5) return '#93c5fd';
        if (count <= 10) return '#60a5fa';
        if (count <= 15) return '#3b82f6';
        return '#1d4ed8';
    };

    const fetchReservationStats = async (signal: AbortSignal) => {
        reservationDispatch({ type: "FETCH_START" });
        try {
            const response = await requests.admin.getReservationStats(signal);

            const chartData: HistogramData[] = Object.entries(response.data).map(([date, count]) => {
                const dateObj = new Date(date);
                const day = dateObj.getDate().toString();

                return {
                    date,
                    day,
                    count: count as number,
                    color: getColorByCount(count as number)
                };
            });

            reservationDispatch({ type: "FETCH_SUCCESS", payload: chartData });
        }
        catch (error: any) {
            if (error.name === "CanceledError" || error.name === "AbortError") {
                return;
            }
            else {
                reservationDispatch({ type: "FETCH_ERROR", payload: error.message || "Rezervasyon istatistikleri çekilirken hata oluştu." });
            }
        }
    };

    const currentMonth = new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

    return (
        <div className="grid grid-cols-2 gap-x-4 mx-20">
            <div className="border-gray-200 border shadow-lg rounded-lg w-full bg-white">
                {(loanStats.isLoading) && (
                    <div className="flex justify-center items-center h-64">
                        <ClipLoader size={40} color="#8B5CF6" />
                    </div>
                )}

                {loanStats.error && (
                    <div className="flex justify-center items-center h-64 text-red-500">
                        {loanStats.error}
                    </div>
                )}

                {loanStats.data && loanStats.data.length > 0 && (
                    <div className="flex flex-col gap-y-2 pt-6">
                        <p className="text-2xl text-violet-400 font-semibold text-center">Kiralama İstatistikleri</p>
                        <div style={{ height: '500px' }}>
                            <ResponsivePie
                                data={loanStats.data}
                                margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                                innerRadius={0.5}
                                padAngle={0.7}
                                cornerRadius={3}
                                activeOuterRadiusOffset={8}
                                borderWidth={1}
                                borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                                arcLinkLabelsSkipAngle={10}
                                arcLinkLabelsTextColor="#333333"
                                arcLinkLabelsThickness={2}
                                arcLinkLabelsColor={{ from: 'color' }}
                                arcLabelsSkipAngle={10}
                                arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                                tooltip={({ datum }) => {
                                    const total = loanStats.data!.reduce((sum, item) => sum + item.value, 0);
                                    const percentage = ((datum.value / total) * 100).toFixed(1);

                                    return (
                                        <div className="bg-gradient-to-br from-white to-gray-50 px-5 py-4 shadow-xl rounded-xl border-2 border-violet-200 min-w-[200px]">
                                            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-200">
                                                <div
                                                    className="w-5 h-5 rounded-full shadow-md"
                                                    style={{ backgroundColor: datum.color }}
                                                />
                                                <strong className="text-gray-800 text-xl font-bold">{datum.label}</strong>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">Kiralama Sayısı:</span>
                                                    <span className="text-lg font-bold text-violet-600">{datum.value}</span>
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">Yüzde:</span>
                                                    <span className="text-md font-semibold text-blue-600">%{percentage}</span>
                                                </div>

                                                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                                    <span className="text-xs text-gray-500">Toplam Kiralama:</span>
                                                    <span className="text-sm font-medium text-gray-700">{total}</span>
                                                </div>
                                            </div>

                                            <div className="mt-3">
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="h-2 rounded-full transition-all duration-300"
                                                        style={{
                                                            width: `${percentage}%`,
                                                            backgroundColor: datum.color
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="border-gray-200 border shadow-lg rounded-lg w-full bg-white">
                {reservationStats.isLoading && (
                    <div className="flex justify-center items-center h-[550px]">
                        <ClipLoader size={40} color="#8B5CF6" />
                    </div>
                )}

                {reservationStats.error && (
                    <div className="flex justify-center items-center h-[550px] text-red-500">
                        {reservationStats.error}
                    </div>
                )}

                {reservationStats.data && reservationStats.data.length > 0 && (
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-semibold text-violet-400">
                                {currentMonth} - Günlük Rezervasyonlar
                            </h2>
                            <div className="flex gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-blue-500 rounded" />
                                    <span className="text-gray-600">Yoğun</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-gray-200 rounded" />
                                    <span className="text-gray-600">Boş</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-96">
                            <ResponsiveBar
                                data={reservationStats.data}
                                keys={['count']}
                                indexBy="day"
                                margin={{ top: 20, right: 30, bottom: 80, left: 60 }}
                                padding={0.2}
                                valueScale={{ type: 'linear' }}
                                indexScale={{ type: 'band', round: true }}
                                colors={(bar) => reservationStats.data![bar.index]?.color || '#3b82f6'}
                                borderRadius={4}
                                borderColor={{
                                    from: 'color',
                                    modifiers: [['darker', 0.3]],
                                }}
                                axisTop={null}
                                axisRight={null}
                                axisBottom={{
                                    tickSize: 5,
                                    tickPadding: 5,
                                    tickRotation: 0,
                                    legend: 'Gün',
                                    legendPosition: 'middle',
                                    legendOffset: 50,
                                    format: (value) => `${value}.`,
                                }}
                                axisLeft={{
                                    tickSize: 5,
                                    tickPadding: 5,
                                    tickRotation: 0,
                                    legend: 'Rezervasyon Sayısı',
                                    legendPosition: 'middle',
                                    legendOffset: -50,
                                    format: (value) => Number.isInteger(value) ? value.toString() : ''
                                }}
                                enableGridY={true}
                                labelSkipWidth={12}
                                labelSkipHeight={12}
                                labelTextColor="#ffffff"
                                animate={true}
                                motionConfig="gentle"
                                tooltip={({ indexValue, value, color }) => {
                                    const totalReservations = reservationStats.data!.reduce((sum, item) => sum + item.count, 0);
                                    const averageReservations = totalReservations / reservationStats.data!.length;
                                    const maxReservations = Math.max(...reservationStats.data!.map((d) => d.count));
                                    const percentage = ((value / totalReservations) * 100).toFixed(1);
                                    const isAboveAverage = value > averageReservations;
                                    const isPeakDay = value === maxReservations;
                                    
                                    return (
                                        <div className="bg-gradient-to-br from-white to-gray-50 px-5 py-4 shadow-2xl rounded-xl border-2 border-violet-200 min-w-[280px]">
                                            <div className="flex items-center justify-between mb-3 pb-3 border-b-2 border-gray-200">
                                                <div className="flex items-center gap-2">
                                                    <div 
                                                        className="w-5 h-5 rounded-full shadow-md ring-2 ring-white" 
                                                        style={{ backgroundColor: color }} 
                                                    />
                                                    <strong className="text-gray-800 text-xl font-bold">{indexValue}. Gün</strong>
                                                </div>
                                                {isPeakDay && (
                                                    <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">
                                                        🔥 En Yoğun
                                                    </span>
                                                )}
                                            </div>

                                            <div className="space-y-2 mb-3">
                                                <div className="flex justify-between items-center bg-blue-50 px-3 py-2 rounded-lg">
                                                    <span className="text-sm text-gray-700 font-medium">Rezervasyon Sayısı:</span>
                                                    <span className="text-xl font-bold text-blue-700">{value}</span>
                                                </div>
                                                
                                                <div className="flex justify-between items-center bg-purple-50 px-3 py-2 rounded-lg">
                                                    <span className="text-sm text-gray-700 font-medium">Oran:</span>
                                                    <span className="text-md font-bold text-purple-700">%{percentage}</span>
                                                </div>

                                                <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg">
                                                    <span className="text-sm text-gray-700 font-medium">Ortalama:</span>
                                                    <span className="text-md font-semibold text-gray-700">
                                                        {averageReservations.toFixed(1)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mb-2">
                                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                    <span>0</span>
                                                    <span>{maxReservations}</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                    <div 
                                                        className="h-2.5 rounded-full transition-all duration-300"
                                                        style={{ 
                                                            width: `${(value / maxReservations) * 100}%`,
                                                            backgroundColor: color 
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex justify-center mt-3 pt-3 border-t border-gray-200">
                                                {value === 0 ? (
                                                    <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-full">
                                                        ⚪ Boş Gün
                                                    </span>
                                                ) : isAboveAverage ? (
                                                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                                                        📈 Ortalamanın Üstünde
                                                    </span>
                                                ) : (
                                                    <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                                                        📊 Ortalamanın Altında
                                                    </span>
                                                )}
                                            </div>

                                            <div className="mt-2 text-center">
                                                <p className="text-xs text-gray-500">
                                                    Toplam {totalReservations} rezervasyondan {value} tanesi
                                                </p>
                                            </div>
                                        </div>
                                    );
                                }}
                            />
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                            <div className="bg-blue-50 rounded-lg p-3">
                                <p className="text-sm text-gray-600">Toplam Rezervasyon</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {reservationStats.data.reduce((sum, item) => sum + item.count, 0)}
                                </p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-3">
                                <p className="text-sm text-gray-600">Ortalama/Gün</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {(reservationStats.data.reduce((sum, item) => sum + item.count, 0) / reservationStats.data.length).toFixed(1)}
                                </p>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-3">
                                <p className="text-sm text-gray-600">En Yoğun Gün</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {Math.max(...reservationStats.data.map((d) => d.count))}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}