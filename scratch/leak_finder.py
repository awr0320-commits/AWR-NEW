import re
import sys

def check_jsx_balance(file_path):
    with open(file_path, 'r') as f:
        lines = f.readlines()

    stack = []
    # Tags to track (case sensitive for motion.div)
    tags_to_track = ['motion.div', 'AnimatePresence', 'div']
    
    # Simple regex to find tags
    # <tag ...> or <tag ... /> or </tag>
    tag_pattern = re.compile(r'<(/?)(motion\.div|AnimatePresence|div)(\s|/|>)')
    
    print(f"Auditing {file_path} for balanced tags...")
    
    for i, line in enumerate(lines):
        line_num = i + 1
        # Skip comments
        if '//' in line and line.strip().startswith('//'):
            continue
            
        for match in tag_pattern.finditer(line):
            is_closing = match.group(1) == '/'
            tag_name = match.group(2)
            
            # Check for self-closing in the same match area or same line
            # This is a bit heuristic but covers <div ... />
            remaining_line = line[match.end()-1:]
            is_self_closing = '/>' in line and (line.find('/>') > match.start()) and (line.find('>', match.start()) == line.find('/>') + 1 or line.find('/>') < line.find('>', match.start()))
            
            # Refined self-closing check: scan until next '>'
            full_line_from_tag = "".join(lines[i:i+5]) # look ahead a bit
            match_start_in_full = line.find(match.group(0))
            tag_content = ""
            brackets = 0
            found_end = False
            for char in full_line_from_tag[match_start_in_full:]:
                tag_content += char
                if char == '<': brackets += 1
                if char == '>': 
                    brackets -= 1
                    if brackets == 0:
                        found_end = True
                        break
            
            if found_end and tag_content.strip().endswith('/>'):
                # print(f"DEBUG: Self-closing {tag_name} at line {line_num}")
                continue

            if is_closing:
                if not stack:
                    print(f"Error: Unexpected closing tag </{tag_name}> at line {line_num}")
                else:
                    last_tag, last_line = stack.pop()
                    if last_tag != tag_name:
                        print(f"Error: Mismatched tag. Opened <{last_tag}> at line {last_line}, closed </{tag_name}> at line {line_num}")
            else:
                stack.append((tag_name, line_num))

    if stack:
        print("\n--- Unclosed Tags Found ---")
        for tag, line in stack:
            print(f"Error: Unclosed tag <{tag}> opened at line {line}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        check_jsx_balance(sys.argv[1])
    else:
        print("Usage: python3 check_tags.py <file_path>")
