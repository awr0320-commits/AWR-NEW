
import re

def check_jsx_balance(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Remove comments
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    content = re.sub(r'//.*', '', content)
    
    # Remove strings (very basic)
    content = re.sub(r'\'[^\']*\'', '', content)
    content = re.sub(r'"[^"]*"', '', content)
    content = re.sub(r'`[^`]*`', '', content, flags=re.DOTALL)
    
    # Remove generics by replacing <Type> or <Type, Type> with nothing
    # (Matches < followed by capital letter, to avoid matching <div)
    # Actually, let's just match <[A-Z][a-zA-Z.]+> and <[A-Z][a-zA-Z.]+\[\]> etc.
    content = re.sub(r'<[A-Z][a-zA-Z.\[\]]+>', '', content)
    content = re.sub(r'<[A-Z][a-zA-Z.\[\]]+, [A-Z][a-zA-Z.\[\]]+>', '', content)

    # Find tokens: <tag, </tag, />
    # We ignore self-closing tags like <img ... /> or <Component ... />
    
    tokens = re.findall(r'</?[a-zA-Z0-9.-]+|/>', content)
    
    stack = []
    for token in tokens:
        if token == '/>':
            if stack:
                stack.pop()
        elif token.startswith('</'):
            tag = token[2:]
            if not stack:
                print(f"Error: Unexpected close tag </{tag}>")
            else:
                last_tag = stack.pop()
                if last_tag != tag:
                    print(f"Error: Mismatched tag: expected </{last_tag}>, found </{tag}>")
        else:
            tag = token[1:]
            stack.append(tag)
            
    if stack:
        print(f"Error: Unclosed tags: {stack}")
    else:
        print("All tags balanced (ignoring self-closing components without /> if they exist)")

if __name__ == "__main__":
    check_jsx_balance('/Users/yangyihong/Downloads/awr/src/App.tsx')
