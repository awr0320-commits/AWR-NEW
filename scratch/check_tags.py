import re

def check_jsx_balance(file_path):
    with open(file_path, 'r') as f:
        lines = f.readlines()
    
    stack = []
    # Simplified regex for tags, ignoring props for now
    tag_re = re.compile(r'<(/?)([a-zA-Z0-9\.]+)')
    
    in_comment = False
    
    for i, line in enumerate(lines):
        line_num = i + 1
        # Ignored commented lines or parts
        if '/*' in line and '*/' in line:
            line = re.sub(r'/\*.*?\*/', '', line)
        if '/*' in line: in_comment = True
        if '*/' in line: 
            in_comment = False
            continue
        if in_comment or line.strip().startswith('//'): continue
        
        # Also clean up the line to avoid string literal contents messing up tags
        line = re.sub(r'".*?"', '""', line)
        line = re.sub(r"'.*?'", "''", line)
        
        for match in tag_re.finditer(line):
            is_closing = match.group(1) == '/'
            tag_name = match.group(2)
            
            # Ignore self-closing tags like <br/> or <img> or <div />
            if not is_closing and (line[match.end():].lstrip().startswith('/>') or tag_name in ['img', 'br', 'hr', 'input']):
                continue
                
            if is_closing:
                if not stack:
                    print(f"Error: Unexpected closing tag </{tag_name}> at line {line_num}")
                else:
                    last_tag, last_line = stack.pop()
                    if last_tag != tag_name:
                        print(f"Error: Mismatched tag. Opened <{last_tag}> at line {last_line}, but closed </{tag_name}> at line {line_num}")
            else:
                stack.append((tag_name, line_num))
    
    for tag, line in stack:
        print(f"Error: Unclosed tag <{tag}> opened at line {line}")

if __name__ == "__main__":
    check_jsx_balance('/Users/yangyihong/Downloads/awr/src/App.tsx')
