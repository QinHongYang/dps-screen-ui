import request from '@/utils/axios';

interface Params {
	startIndex: number;
	queryNum: number;
}
// 服务器列表
export const apiServerList = (params: Params) => {
	return request({
		url: '/m-screen/statistics/getServerList',
		method: 'get',
		params: {
			...params,
		},
	});
};

// 预警列表
export const apiWarningList = (params: Params) => {
	return request({
		url: '/m-screen/statistics/getWarningList',
		method: 'get',
		params: {
			...params,
		},
	});
};

// 工单列表
export const apiOrderList = (params: Params) => {
	return request({
		url: '/m-screen/statistics/getOrderList',
		method: 'get',
		params: {
			...params,
		},
	});
};
