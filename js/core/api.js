// This preview stores fictional awards in the current browser.
const storageKey = 'pkgreenrooms.preview.awards';
const token = 'pkgreenrooms-demo';
const user = { username: 'demo', name: 'ครูทดสอบ', role: 'Teacher' };

function seedAwards() {
    const groups = ['กลุ่มสาระการเรียนรู้คณิตศาสตร์', 'กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี'];
    return Array.from({ length: 61 }, (_, index) => ({
        id: 'demo-' + index,
        competition: 'ผลงานตัวอย่าง ' + (index + 1),
        level: index % 2 ? 'ระดับชาติ' : 'ระดับจังหวัด',
        rank: index % 2 ? 'เหรียญทอง' : 'เหรียญเงิน',
        organizer: 'หน่วยงานตัวอย่าง',
        awardDate: '2026-06-15',
        timestamp: new Date(2026, 5, 15, 0, index).toISOString(),
        author: user.username,
        onBehalfOf: [groups[index % groups.length]],
        department: ['ไม่มีกลุ่มงาน'],
        students: [{ name: 'นักเรียนตัวอย่าง ' + (index + 1), grade: 'ม.2', room: '1' }],
        teachers: [{ name: user.name, department: groups[0], roleType: 'teacher' }],
        fileUrls: index % 2 ? ['assets/example_certificates.jpg'] : [],
        isGetReward: index % 5 === 0
    }));
}

function parseList(value) {
    return typeof value === 'string' ? JSON.parse(value) : value;
}

export async function requestAwards(payload) {
    const raw = localStorage.getItem(storageKey);
    let awards = raw ? JSON.parse(raw) : seedAwards();
    const reply = data => ({ json: async () => data });
    if (!payload) return reply(awards);

    const { action } = payload;
    if (action === 'login') {
        return reply(payload.username === 'demo' && payload.password === 'demo'
            ? { success: true, token, user }
            : { success: false, message: 'บัญชีทดสอบใช้ demo / demo' });
    }
    if (action === 'reset_password') {
        return reply({ success: false, message: 'เว็บทดสอบใช้ demo / demo' });
    }
    if (payload.token !== token) {
        return reply({ success: false, message: 'กรุณาเข้าสู่ระบบด้วยบัญชีทดสอบ' });
    }
    if (action === 'validate_token') return reply({ success: true, user });

    if (action === 'save_award' || action === 'edit_award') {
        const previous = awards.find(item => item.id === payload.id);
        if (action === 'edit_award' && !previous) {
            return reply({ success: false, message: 'ไม่พบผลงาน' });
        }
        const files = parseList(payload.files) || [];
        const item = {
            ...previous,
            id: previous?.id ?? crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            competition: payload.competitionName,
            level: payload.awardLevel,
            rank: payload.awardRank,
            organizer: payload.organizer,
            awardDate: payload.awardDate,
            onBehalfOf: payload.onBehalfOf,
            department: payload.department,
            students: parseList(payload.students),
            teachers: parseList(payload.teachers),
            notes: payload.notes,
            fileUrls: files.length ? ['assets/example_certificates.jpg'] : (previous?.fileUrls ?? []),
            author: user.username,
            isGetReward: previous?.isGetReward ?? false
        };
        awards = previous ? awards.map(row => row.id === previous.id ? item : row) : [...awards, item];
    } else if (action === 'delete_award') {
        awards = awards.filter(item => item.id !== payload.id);
    } else if (action === 'mark_rewarded') {
        awards = awards.map(item => payload.ids.includes(item.id)
            ? { ...item, isGetReward: payload.status !== false }
            : item);
    } else {
        return reply({ success: false, message: 'ไม่รองรับคำขอนี้ในเว็บทดสอบ' });
    }
    localStorage.setItem(storageKey, JSON.stringify(awards));
    return reply({ success: true });
}
