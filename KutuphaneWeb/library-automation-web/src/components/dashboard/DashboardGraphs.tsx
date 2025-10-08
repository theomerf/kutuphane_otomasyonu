import { useEffect, useReducer } from 'react';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar, type BarDatum } from '@nivo/bar';
import { transformToNivoData } from '../../utils/chartDataTransformer';
import requests from '../../services/api';
import BackendDataListReducer from '../../types/backendDataList';
import { ClipLoader } from 'react-spinners';
import { useBreakpoint } from '../../hooks/useBreakpoint';

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
    const { up } = useBreakpoint();
    const isMobile = !up.md;
    const isTablet = up.md && !up.lg;

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


    const getPieMargins = () => {
        if (isMobile) return { top: 20, right: 20, bottom: 60, left: 20 };
        if (isTablet) return { top: 30, right: 40, bottom: 70, left: 40 };
        return { top: 40, right: 80, bottom: 80, left: 80 };
    };

    const getBarMargins = () => {
        if (isMobile) return { top: 10, right: 10, bottom: 60, left: 40 };
        if (isTablet) return { top: 15, right: 20, bottom: 70, left: 50 };
        return { top: 20, right: 30, bottom: 80, left: 60 };
    };

    return (
        <div className="grid grid-cols-1 gap-y-4 lg:grid-cols-2 gap-x-4 mx-4 md:mx-10 lg:mx-20">
            <div className="border-gray-200 border shadow-lg rounded-lg w-full bg-white">
                {(loanStats.isLoading) && (
                    <div className="flex justify-center items-center h-64">
                        <ClipLoader size={40} color="#8B5CF6" />
                    </div>
                )}

                {loanStats.error && (
                    <div className="flex justify-center items-center h-64 text-red-500 px-4 text-center">
                        {loanStats.error}
                    </div>
                )}

                {loanStats.data && loanStats.data.length > 0 && (
                    <div className="flex flex-col gap-y-2 pt-4 md:pt-6">
                        <p className="text-xl md:text-2xl text-violet-400 font-semibold text-center px-4">
                            Kiralama İstatistikleri
                        </p>
                        <div style={{ height: isMobile ? '350px' : isTablet ? '450px' : '500px' }}>
                            <ResponsivePie
                                data={loanStats.data}
                                margin={getPieMargins()}
                                innerRadius={isMobile ? 0.4 : 0.5}
                                padAngle={0.7}
                                cornerRadius={3}
                                activeOuterRadiusOffset={isMobile ? 4 : 8}
                                borderWidth={1}
                                borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                                arcLinkLabelsSkipAngle={isMobile ? 15 : 10}
                                arcLinkLabelsTextColor="#333333"
                                arcLinkLabelsThickness={2}
                                arcLinkLabelsColor={{ from: 'color' }}
                                arcLabelsSkipAngle={isMobile ? 15 : 10}
                                arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                                enableArcLinkLabels={!isMobile}
                                tooltip={({ datum }) => {
                                    const total = loanStats.data!.reduce((sum, item) => sum + item.value, 0);
                                    const percentage = ((datum.value / total) * 100).toFixed(1);

                                    return (
                                        <div className={`bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-xl border-2 border-violet-200 ${
                                            isMobile ? 'px-3 py-2 min-w-[160px]' : 'px-5 py-4 min-w-[200px]'
                                        }`}>
                                            <div className={`flex items-center gap-2 mb-2 pb-2 border-b border-gray-200 ${
                                                isMobile ? 'flex-col items-start' : 'flex-row'
                                            }`}>
                                                <div
                                                    className={`rounded-full shadow-md ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`}
                                                    style={{ backgroundColor: datum.color }}
                                                />
                                                <strong className={`text-gray-800 font-bold ${
                                                    isMobile ? 'text-base' : 'text-xl'
                                                }`}>
                                                    {datum.label}
                                                </strong>
                                            </div>

                                            <div className="space-y-1.5">
                                                <div className="flex justify-between items-center">
                                                    <span className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                                                        Kiralama:
                                                    </span>
                                                    <span className={`font-bold text-violet-600 ${
                                                        isMobile ? 'text-base' : 'text-lg'
                                                    }`}>
                                                        {datum.value}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <span className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                                                        Yüzde:
                                                    </span>
                                                    <span className={`font-semibold text-blue-600 ${
                                                        isMobile ? 'text-sm' : 'text-md'
                                                    }`}>
                                                        %{percentage}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between items-center pt-1.5 border-t border-gray-100">
                                                    <span className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                                                        Toplam:
                                                    </span>
                                                    <span className={`font-medium text-gray-700 ${
                                                        isMobile ? 'text-xs' : 'text-sm'
                                                    }`}>
                                                        {total}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mt-2">
                                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                    <div
                                                        className="h-1.5 rounded-full transition-all duration-300"
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
                    <div className="flex justify-center items-center h-[400px] md:h-[550px]">
                        <ClipLoader size={40} color="#8B5CF6" />
                    </div>
                )}

                {reservationStats.error && (
                    <div className="flex justify-center items-center h-[400px] md:h-[550px] text-red-500 px-4 text-center">
                        {reservationStats.error}
                    </div>
                )}

                {reservationStats.data && reservationStats.data.length > 0 && (
                    <div className="p-4 md:p-6">
                        <div className={`flex items-center mb-3 md:mb-4 ${
                            isMobile ? 'flex-col gap-2' : 'flex-row justify-between'
                        }`}>
                            <h2 className={`font-semibold text-violet-400 ${
                                isMobile ? 'text-lg text-center' : 'text-2xl'
                            }`}>
                                {isMobile ? currentMonth.split(' ')[0] : currentMonth} - Rezervasyonlar
                            </h2>
                            <div className="flex gap-2 md:gap-4 text-xs md:text-sm">
                                <div className="flex items-center gap-1 md:gap-2">
                                    <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-500 rounded" />
                                    <span className="text-gray-600">Yoğun</span>
                                </div>
                                <div className="flex items-center gap-1 md:gap-2">
                                    <div className="w-3 h-3 md:w-4 md:h-4 bg-gray-200 rounded" />
                                    <span className="text-gray-600">Boş</span>
                                </div>
                            </div>
                        </div>

                        <div className={isMobile ? 'h-64' : isTablet ? 'h-80' : 'h-96'}>
                            <ResponsiveBar
                                data={reservationStats.data}
                                keys={['count']}
                                indexBy="day"
                                margin={getBarMargins()}
                                padding={isMobile ? 0.3 : 0.2}
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
                                    tickRotation: isMobile ? -45 : 0,
                                    legend: isMobile ? '' : 'Gün',
                                    legendPosition: 'middle',
                                    legendOffset: isMobile ? 45 : 50,
                                    format: (value) => isMobile ? `${value}` : `${value}.`,
                                }}
                                axisLeft={{
                                    tickSize: 5,
                                    tickPadding: 5,
                                    tickRotation: 0,
                                    legend: isMobile ? '' : 'Rezervasyon Sayısı',
                                    legendPosition: 'middle',
                                    legendOffset: isMobile ? -35 : -50,
                                    format: (value) => Number.isInteger(value) ? value.toString() : ''
                                }}
                                enableGridY={true}
                                labelSkipWidth={12}
                                labelSkipHeight={12}
                                labelTextColor="#ffffff"
                                animate={true}
                                motionConfig="gentle"
                                enableLabel={!isMobile}
                                tooltip={({ indexValue, value, color }) => {
                                    const totalReservations = reservationStats.data!.reduce((sum, item) => sum + item.count, 0);
                                    const averageReservations = totalReservations / reservationStats.data!.length;
                                    const maxReservations = Math.max(...reservationStats.data!.map((d) => d.count));
                                    const percentage = ((value / totalReservations) * 100).toFixed(1);
                                    const isAboveAverage = value > averageReservations;
                                    const isPeakDay = value === maxReservations;
                                    
                                    return (
                                        <div className={`bg-gradient-to-br from-white to-gray-50 shadow-2xl rounded-xl border-2 border-violet-200 ${
                                            isMobile ? 'px-3 py-2 min-w-[200px]' : 'px-5 py-4 min-w-[280px]'
                                        }`}>
                                            <div className={`flex items-center mb-2 pb-2 border-b-2 border-gray-200 ${
                                                isMobile ? 'flex-col gap-1' : 'flex-row justify-between'
                                            }`}>
                                                <div className="flex items-center gap-2">
                                                    <div 
                                                        className={`rounded-full shadow-md ring-2 ring-white ${
                                                            isMobile ? 'w-4 h-4' : 'w-5 h-5'
                                                        }`}
                                                        style={{ backgroundColor: color }} 
                                                    />
                                                    <strong className={`text-gray-800 font-bold ${
                                                        isMobile ? 'text-base' : 'text-xl'
                                                    }`}>
                                                        {indexValue}. Gün
                                                    </strong>
                                                </div>
                                                {isPeakDay && (
                                                    <span className={`bg-yellow-100 text-yellow-800 font-semibold px-2 py-1 rounded-full ${
                                                        isMobile ? 'text-xs' : 'text-xs'
                                                    }`}>
                                                        🔥 En Yoğun
                                                    </span>
                                                )}
                                            </div>

                                            <div className="space-y-1.5 mb-2">
                                                <div className={`flex justify-between items-center bg-blue-50 px-2 md:px-3 py-1.5 md:py-2 rounded-lg`}>
                                                    <span className={`text-gray-700 font-medium ${
                                                        isMobile ? 'text-xs' : 'text-sm'
                                                    }`}>
                                                        Rezervasyon:
                                                    </span>
                                                    <span className={`font-bold text-blue-700 ${
                                                        isMobile ? 'text-base' : 'text-xl'
                                                    }`}>
                                                        {value}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex justify-between items-center bg-purple-50 px-2 md:px-3 py-1.5 md:py-2 rounded-lg">
                                                    <span className={`text-gray-700 font-medium ${
                                                        isMobile ? 'text-xs' : 'text-sm'
                                                    }`}>
                                                        Oran:
                                                    </span>
                                                    <span className={`font-bold text-purple-700 ${
                                                        isMobile ? 'text-sm' : 'text-md'
                                                    }`}>
                                                        %{percentage}
                                                    </span>
                                                </div>

                                                {!isMobile && (
                                                    <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg">
                                                        <span className="text-sm text-gray-700 font-medium">Ortalama:</span>
                                                        <span className="text-md font-semibold text-gray-700">
                                                            {averageReservations.toFixed(1)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mb-2">
                                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                    <span>0</span>
                                                    <span>{maxReservations}</span>
                                                </div>
                                                <div className={`w-full bg-gray-200 rounded-full ${
                                                    isMobile ? 'h-2' : 'h-2.5'
                                                }`}>
                                                    <div 
                                                        className={`rounded-full transition-all duration-300 ${
                                                            isMobile ? 'h-2' : 'h-2.5'
                                                        }`}
                                                        style={{ 
                                                            width: `${(value / maxReservations) * 100}%`,
                                                            backgroundColor: color 
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {!isMobile && (
                                                <>
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
                                                </>
                                            )}
                                        </div>
                                    );
                                }}
                            />
                        </div>

                        <div className={`mt-3 md:mt-4 grid gap-2 md:gap-4 text-center ${
                            isMobile ? 'grid-cols-2' : 'grid-cols-3'
                        }`}>
                            <div className="bg-blue-50 rounded-lg p-2 md:p-3">
                                <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                                    {isMobile ? 'Toplam' : 'Toplam Rezervasyon'}
                                </p>
                                <p className={`font-bold text-blue-600 ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                                    {reservationStats.data.reduce((sum, item) => sum + item.count, 0)}
                                </p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-2 md:p-3">
                                <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                                    Ortalama{isMobile ? '' : '/Gün'}
                                </p>
                                <p className={`font-bold text-green-600 ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                                    {(reservationStats.data.reduce((sum, item) => sum + item.count, 0) / reservationStats.data.length).toFixed(1)}
                                </p>
                            </div>
                            {!isMobile && (
                                <div className="bg-purple-50 rounded-lg p-3">
                                    <p className="text-sm text-gray-600">En Yoğun Gün</p>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {Math.max(...reservationStats.data.map((d) => d.count))}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}