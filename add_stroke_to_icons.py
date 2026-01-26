#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont
import os

def create_icon_with_stroke(size, output_path):
    """创建带描边效果的 IA 图标（紫色圆形背景）"""
    # 创建透明背景
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 绘制紫色圆形背景
    # 紫色：#8B5CF6 (RGB: 139, 92, 246)
    circle_margin = 0
    draw.ellipse(
        [circle_margin, circle_margin, size - circle_margin, size - circle_margin],
        fill=(139, 92, 246, 255)
    )
    
    # 字体大小根据图标尺寸调整（放大到 0.7 倍）
    font_size = int(size * 0.7)
    
    try:
        # 尝试使用系统字体（加粗）
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
    except:
        # 如果找不到字体，使用默认字体
        font = ImageFont.load_default()
    
    # 文本内容
    text = "IA"
    
    # 获取文本边界框
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    # 计算居中位置
    x = (size - text_width) // 2 - bbox[0]
    y = (size - text_height) // 2 - bbox[1]
    
    # 描边宽度（根据图标大小调整）
    stroke_width = max(1, size // 24)
    
    # 绘制文字（白色文字 + 黑色描边）
    draw.text((x, y), text, font=font, fill=(255, 255, 255, 255), stroke_width=stroke_width, stroke_fill=(0, 0, 0, 255))
    
    # 保存图标
    img.save(output_path, 'PNG')
    print(f"已创建: {output_path} (大小: {size}x{size}, 描边宽度: {stroke_width})")

# 图标尺寸和路径配置
icons = [
    (16, 'assets/icon16.png'),
    (32, 'assets/icon32.png'),
    (48, 'assets/icon48.png'),
    (64, 'assets/icon64.png'),
    (128, 'assets/icon128.png'),
    (128, 'assets/icon.png'),  # 默认图标使用 128x128
    (16, 'images/icon16.png'),
    (48, 'images/icon48.png'),
]

# 生成所有图标
for size, path in icons:
    output_path = os.path.join('/Users/jia.xia/development/impersonate-agents-new', path)
    create_icon_with_stroke(size, output_path)

print("\n所有图标已更新完成！")
