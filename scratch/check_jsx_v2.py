import re
import sys

def check_jsx_balance(file_path):
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Void elements in HTML/JSX that don't need closing/can be self-closing
    VOID_ELEMENTS = {'input', 'img', 'br', 'hr', 'meta', 'link', 'area', 'base', 'col', 'embed', 'param', 'source', 'track', 'wbr'}
    
    # Simple regex to find tags
    tag_pattern = r'<(/?)([a-zA-Z0-9\._]+)'
    
    tags_stack = []
    
    in_string = False
    in_string_char = ''
    in_comment = False
    in_jsx_tag = False
    
    i = 0
    lines = content.split('\n')
    
    # Tracking current line and column for better errors
    for line_idx, line in enumerate(lines):
        line_no = line_idx + 1
        j = 0
        while j < len(line):
            char = line[j]
            
            # Handle comments
            if not in_string and line[j:j+2] == '//':
                break # Rest of line is comment
            if not in_string and line[j:j+2] == '/*':
                in_comment = True
                j += 2
                continue
            if in_comment:
                if line[j:j+2] == '*/':
                    in_comment = False
                    j += 2
                else:
                    j += 1
                continue
            
            # Handle strings
            if char in ['"', "'", '`'] and (j == 0 or line[j-1] != '\\'):
                if in_string and in_string_char == char:
                    in_string = False
                elif not in_string:
                    in_string = True
                    in_string_char = char
            
            if in_string:
                j += 1
                continue
                
            # Handle JSX tags
            if char == '<' and j + 1 < len(line) and (line[j+1].isalpha() or line[j+1] == '/' or line[j+1] == '>'):
                # Potential tag start
                # Fragment support
                if line[j:j+2] == '<>':
                    tags_stack.append(('FRAGMENT', line_no))
                    j += 2
                    continue
                if line[j:j+3] == '</>':
                    if not tags_stack:
                        print(f"Error: Unexpected closing fragment </> at line {line_no}")
                    else:
                        last_tag, last_line = tags_stack.pop()
                        if last_tag != 'FRAGMENT':
                            print(f"Error: Mismatched tag. Opened <{last_tag}> at line {last_line}, closed with </> at line {line_no}")
                    j += 3
                    continue
                
                # Normal tag
                match = re.match(tag_pattern, line[j:])
                if match:
                    is_closing = match.group(1) == '/'
                    tag_name = match.group(2)
                    
                    # Find end of tag
                    k = j
                    is_self_closing = False
                    depth = 0
                    while k < len(line):
                        if line[k] == '{': depth += 1
                        if line[k] == '}': depth -= 1
                        if depth == 0 and line[k] == '>':
                            if k > 0 and line[k-1] == '/':
                                is_self_closing = True
                            break
                        k += 1
                    
                    # If it's a void element and NOT a component (starts with lowercase)
                    # in JSX void elements MUST be self-closing or have a close tag
                    # But for our parser, we treat them as self-closing if they are lowercase void-types
                    # IMPORTANT: In React, <input> without / is a SYNTAX ERROR.
                    
                    if not is_self_closing:
                        if is_closing:
                            if not tags_stack:
                                print(f"Error: Unexpected closing tag </{tag_name}> at line {line_no}")
                            else:
                                last_tag, last_line = tags_stack.pop()
                                if last_tag != tag_name:
                                    print(f"Error: Mismatched tag. Opened <{last_tag}> at line {last_line}, closed </{tag_name}> at line {line_no}")
                        else:
                            tags_stack.append((tag_name, line_no))
                    
                    j = k + 1
                    continue
            
            j += 1
            
    # Final check
    if tags_stack:
        for tag, line in tags_stack:
            print(f"Error: Unclosed tag <{tag}> opened at line {line}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        check_jsx_balance(sys.argv[1])
    else:
        print("Usage: python3 check_jsx_v2.py <file_path>")
