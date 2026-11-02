# Sống đáng đồng tiền: bản tiếng Việt (đang dịch)

Đây là bản tiếng Việt của 高性价比人生指南 ([eternity4719/HowToLiveBetter](https://github.com/eternity4719/HowToLiveBetter)).
Mỗi mục là một lời khuyên, kèm cái giá phải trả, cái được, mức chứng cứ và nguồn gốc.
Phần bằng chứng y học được dịch sát bản gốc. Phần luật, số điện thoại khẩn cấp, cơ quan nhà nước và chế độ được viết lại theo quy định của Việt Nam, tính đến ngày 2/11/2026.
Mục nào chưa tìm được quy định Việt Nam có nguồn chính thức thì để lại ghi chú TODO.

Sách có thể lỗi thời hoặc có chỗ sai. Khi thật sự đi làm thủ tục, đi khám hay ra tòa, hãy theo hướng dẫn của cơ quan, bác sĩ và luật sư nơi bạn ở.

## Đang có

Đã có 6/34 phần:

- [1. Đừng chết sớm](book/01-dung-chet-som.md)
- [2. Đừng chết từ từ](book/02-dung-chet-tu-tu.md)
- [3. Đừng lãng phí sức lực](book/03-dung-lang-phi-suc-luc.md)
- [4. Đừng lãng phí thời gian](book/04-dung-lang-phi-thoi-gian.md)
- [5. Đừng lãng phí tiền](book/05-dung-lang-phi-tien.md)
- [8. Đừng tự chuốc họa vào thân: pháp luật và an toàn tài sản](book/08-dung-tu-chuoc-hoa-vao-than-phap-luat.md)

Số thứ tự phần và mục giữ đúng như bản gốc tiếng Trung, nên "phần X mục Y" ở bản này và bản gốc chỉ cùng một mục.

## Đọc một mục thế nào

- **Chi phí**: phải bỏ ra bao nhiêu tiền, thời gian, công sức. Số tiền bằng đồng là ước tính để so sánh, không dùng để trích dẫn.
- **Nói dễ hiểu**: tóm tắt phần lợi ích bằng lời thường.
- **Lợi ích**: con số và điều luật cụ thể.
- **Mức chứng cứ**: A là có số liệu từ nghiên cứu lớn, hoặc văn bản chính thức có con số cụ thể đã đối chiếu bản gốc. B là có nghiên cứu hoặc văn bản nhưng khó định lượng. C là kinh nghiệm hoặc đồng thuận chung.
- **Nguồn**: bài báo khoa học hoặc văn bản chính thức. Văn bản pháp luật Việt Nam dẫn từ vbpl.vn, Công báo và trang của cơ quan nhà nước.
- **Ghi chú**: điều kiện áp dụng, ý kiến trái chiều (bắt đầu bằng "Tranh cãi"), ai là người được lợi chính.

## Cách làm bản này

Quy ước biên dịch, quy tắc nguồn và ngưỡng phân loại: [TRANSLATION.md](TRANSLATION.md).
Nhật ký nghiên cứu từng mục, có câu trích nguyên văn từ văn bản Việt Nam: [translation/log/](translation/log/).
Báo cáo kiểm tra độc lập: [translation/verify/](translation/verify/).
Các căn cứ pháp lý dùng chung: [translation/vn-baseline.md](translation/vn-baseline.md).

## Hiểu các con số

Sách cố dùng lời thường, nhưng khi dẫn nghiên cứu thì khó tránh vài thuật ngữ thống kê. Không hiểu thì tra bảng này. Trên trang tra cứu, từ nào có gạch chân chấm chấm thì rê chuột lên (hoặc chạm vào trên điện thoại) để xem giải thích.

| Thuật ngữ | Nghĩa |
| --- | --- |
| tỷ lệ tử vong do mọi nguyên nhân | Trong một khoảng thời gian, số người chết chiếm bao nhiêu phần trong một nhóm người, dù chết vì bất kỳ lý do gì. Sách dùng con số này để đo xem sống lâu hay không. |
| HR, tỷ số nguy cơ | So xem trong lúc theo dõi, những người chưa gặp chuyện ở nhóm này gặp chuyện nhanh hay chậm hơn nhóm kia. HR 0.87 nghĩa là nguy cơ đó thấp hơn 13%. Nó không có nghĩa là xác suất gặp chuyện trong cả thời gian theo dõi thấp hơn 13%. |
| RR, nguy cơ tương đối | Lấy xác suất gặp chuyện của nhóm này chia cho nhóm kia, trong cùng một thời gian theo dõi. RR 0.87 nghĩa là thấp hơn 13% so với nhóm kia, không phải cứ 100 người thì bớt 13 người gặp chuyện. |
| OR, tỷ số chênh | Mỗi nhóm tính riêng "xác suất gặp chuyện chia cho xác suất không gặp chuyện", rồi so hai con số đó. Nó không phải tỷ số giữa hai xác suất. Chỉ khi chuyện đó hiếm gặp thì nó mới gần bằng RR, nên không đổi thẳng thành "cao hơn hay thấp hơn mấy phần" được. |
| IRR, tỷ số tỷ suất mắc | Tỷ suất mắc là số ca mới xảy ra trong một khoảng thời gian, tính trên số người được theo dõi. Lấy tỷ suất của nhóm này chia cho nhóm kia, đọc giống RR. |
| SMR, tỷ số tử vong chuẩn hóa | Số người chết thực tế trong một nhóm, chia cho số người lẽ ra sẽ chết nếu họ giống người bình thường cùng tuổi. SMR 15 nghĩa là số người chết gấp 15 lần người cùng tuổi. |
| 95% CI, khoảng tin cậy | Con số tính ra từ một nghiên cứu luôn có sai số. Đây là khoảng mà con số thật rất có thể nằm trong đó. Với con số dạng "gấp mấy lần", nếu khoảng này vắt qua 1 thì khác biệt giữa hai nhóm có thể chỉ là ngẫu nhiên. Với con số dạng cộng trừ, mốc đó là 0. Khi đó sách ghi là "không có ý nghĩa thống kê". |
| RCT, thử nghiệm ngẫu nhiên có đối chứng, thử nghiệm chia nhóm ngẫu nhiên | Chia người tham gia thành hai nhóm bằng cách giống như bốc thăm. Một nhóm làm việc đó, nhóm kia không làm, rồi so kết quả. Muốn chứng minh chính việc đó có tác dụng, đây là cách thuyết phục nhất. |
| phân tích gộp | Gộp kết quả của nhiều nghiên cứu lại rồi tính lại, ra một con số chung. Tiếng Anh gọi là meta-analysis. |
| nghiên cứu theo dõi | Chọn một nhóm rất đông người, theo dõi nhiều năm và ghi lại ai gặp chuyện. Người nghiên cứu chỉ ghi nhận, không chia nhóm can thiệp. Cách này cho thấy hai việc hay đi cùng nhau, nhưng chưa đủ chứng minh việc trước gây ra việc sau. |
| BMI | Chỉ số khối cơ thể, con số hay dùng để xem gầy hay béo. Lấy cân nặng tính bằng kg chia cho bình phương chiều cao tính bằng mét. |

## Giấy phép

Nội dung theo [CC BY 4.0](LICENSE), mã nguồn theo [MIT](LICENSE-CODE).
Bản gốc tiếng Trung do eternity4719 và các cộng tác viên viết. Bản này đã dịch và chỉnh sửa theo luật Việt Nam; thay đổi của từng mục ghi trong `translation/log/`.
