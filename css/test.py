import pdfplumber
import pandas as pd
import os

def extract_table_from_text(page):
    """
    基于文本分析从页面提取表格数据
    特别优化用于提取无边框表格
    
    Args:
        page (pdfplumber.page.Page): PDF页面对象
        
    Returns:
        list: 提取的表格列表
    """
    tables = []
    
    try:
        # 获取页面中的所有文本块
        words = page.extract_words(x_tolerance=3, y_tolerance=3, keep_blank_chars=True)
        
        if not words:
            return tables
        
        # 按y坐标分组，识别行
        lines = {}
        for word in words:
            y = round(word['top'], 1)  # 四舍五入到一位小数，处理微小的位置差异
            if y not in lines:
                lines[y] = []
            lines[y].append(word)
        
        # 按y坐标排序行
        sorted_lines = sorted(lines.items(), key=lambda x: x[0])
        
        # 构建表格行
        table = []
        for y, line_words in sorted_lines:
            # 按x坐标排序单词
            sorted_words = sorted(line_words, key=lambda x: x['x0'])
            
            # 构建行数据
            row = []
            for word in sorted_words:
                row.append(word['text'])
            
            # 只添加有内容的行
            if any(cell.strip() for cell in row):
                # 确保每行至少有4列（基于用户提供的表格格式）
                while len(row) < 4:
                    row.append("")
                table.append(row)
        
        # 如果表格有足够的行，添加到结果中
        if len(table) >= 2:
            tables.append(table)
            
    except Exception as e:
        print(f"文本分析提取表格时出错：{str(e)}")
    
    return tables

def extract_tables_from_pdf_page(file_path, page_number):
    """
    从PDF文件的指定页面提取表格数据
    
    Args:
        file_path (str): PDF文件路径
        page_number (int): 页码（从0开始）
        
    Returns:
        list: 提取的表格列表
    """
    try:
        # 检查文件是否存在
        if not os.path.exists(file_path):
            print(f"错误：文件 '{file_path}' 不存在")
            return []
        
        # 打开PDF文件
        with pdfplumber.open(file_path) as pdf:
            # 检查页码是否有效
            if page_number < 0 or page_number >= len(pdf.pages):
                print(f"错误：页码 {page_number + 1} 超出范围，PDF总页数为 {len(pdf.pages)}")
                return []
            
            # 获取指定页面
            page = pdf.pages[page_number]
            print(f"正在处理第 {page_number + 1} 页...")
            
            # 直接尝试使用自定义设置提取无边框表格，因为用户说明表格边框是没用的
            print("使用自定义设置专门提取无边框表格...")
            tables = page.extract_tables(table_settings={
                "vertical_strategy": "text",
                "horizontal_strategy": "text",
                "snap_y_tolerance": 3,
                "snap_x_tolerance": 5,
                "join_tolerance": 3,
                "text_tolerance": 3,
                "text_x_tolerance": 10,
                "text_y_tolerance": 5,
                "keep_blank_chars": True
            })
            
            # 如果自定义设置没有找到表格，尝试其他策略
            if not tables:
                print("使用默认stream模式...")
                tables = page.extract_tables()
            
            # 即使找到了表格，也尝试使用文本分析作为补充，确保捕获所有列
            print("尝试使用文本分析方法作为补充...")
            text_tables = extract_table_from_text(page)
            if text_tables:
                print(f"文本分析找到 {len(text_tables)} 个表格，合并结果")
                # 合并两种方法的结果
                tables.extend(text_tables)
            
            print(f"在第 {page_number + 1} 页找到 {len(tables)} 个表格")
            return tables
            
    except Exception as e:
        print(f"处理PDF文件时出错：{str(e)}")
        return []

def print_table_data(table, table_index):
    """
    打印表格数据
    
    Args:
        table (list): 表格数据（二维列表）
        table_index (int): 表格索引
    """
    print(f"\n===== 表格 {table_index + 1} =====")
    
    if not table:
        print("表格为空")
        return
    
    # 创建DataFrame以更好地展示表格数据
    try:
        df = pd.DataFrame(table)
        # 尝试设置第一行为列名
        if df.shape[0] > 0:
            df.columns = df.iloc[0]
            df = df[1:]
        print(df.to_string(index=False))
    except Exception as e:
        print("无法使用pandas格式化表格，直接打印原始数据：")
        # 直接打印原始表格数据
        max_cols = 0
        for row in table:
            if row and len(row) > max_cols:
                max_cols = len(row)
        
        # 格式化并打印表格
        for row in table:
            if row:
                print(" | ".join(str(cell) if cell else "" for cell in row))
            else:
                print()

def extract_tables_from_page_119():
    """
    从指定PDF文件的第119页提取并打印表格
    """
    # 文件路径
    file_path = "F:/code/python/python代码/股票分析/正式-股票pdf文件数据抓取3.0-liwuxie/财务报告文件/格力电器：2021年年度报告.pdf"
    
    # 第119页（在pdfplumber中从0开始，所以是118）
    target_page = 118
    
    print(f"开始从文件 '{file_path}' 中提取第 {target_page + 1} 页的表格...")
    
    # 提取表格
    tables = extract_tables_from_pdf_page(file_path, target_page)
    
    if not tables:
        print("未找到任何表格")
    else:
        print(f"\n总共找到 {len(tables)} 个表格，详情如下：")
        # 打印每个表格的数据
        for i, table in enumerate(tables):
            print_table_data(table, i)
    
    print("\n表格提取完成")

if __name__ == "__main__":
    print("PDF表格提取工具")
    print("=" * 50)
    
    # 检查必要的库是否已安装
    try:
        import pdfplumber
        import pandas as pd
    except ImportError:
        print("请先安装必要的库：")
        print("pip install pdfplumber pandas")
        exit(1)
    
    # 执行表格提取
    extract_tables_from_page_119()