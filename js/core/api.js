const API_URL = "https://script.google.com/macros/s/AKfycbynQNSmnMp-HFV53QskSMZPp76XO9ZlHQomvXqElMy-nREf1G6mxK3JMeiS44nHSeJdTg/exec";

export function requestAwards(payload) {
    if (payload === undefined) return fetch(API_URL);

    return Promise.resolve({
        json: async () => ({
            success: false,
            message: 'เว็บทดสอบนี้เปิดดูข้อมูลจริงได้อย่างเดียว'
        })
    });
}
