function CurrentTor({activetab}) {
    return (
        <div>
            <div>{activetab}</div>
            <table>
                <thead>
                    {/* FIX: Add <tr> here to wrap the <th> elements */}
                    <tr>
                        <th>ผลัด</th>
                        <th>กำลังพล</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th>เช้า</th>
                        <td>518</td>
                    </tr>
                    <tr>
                        <th>บ่าย</th>
                        <td>518</td>
                    </tr>
                    <tr>
                        <th>ดึก</th>
                        <td>518</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default CurrentTor;