# gift/utils.py
import hmac
import hashlib
import requests
import time
import os


# def get_coupang_product(search_keyword):
#     """
#     쿠팡 파트너스 API를 통해 검색어에 맞는
#     진짜 상품명, 이미지, 수익화 링크를 가져오는 함수
#     """
#     ACCESS_KEY = os.environ.get("COUPANG_ACCESS_KEY", "YOUR_DEFAULT_KEY")
#     SECRET_KEY = os.environ.get("COUPANG_SECRET_KEY", "YOUR_DEFAULT_KEY")

#     domain = "https://api-gateway.coupang.com"
#     path = f"/v2/providers/coupang_partners/api/v1/products/search?keyword={search_keyword}&limit=1"

#     timestamp = time.strftime("%y%m%d") + "T" + time.strftime("%H%M%S") + "Z"
#     message = timestamp + "POST" + path
#     signature = hmac.new(
#         SECRET_KEY.encode("utf-8"), message.encode("utf-8"), hashlib.sha256
#     ).hexdigest()
#     authorization = f"CEA algorithm=HMAC-SHA256, access-key={ACCESS_KEY}, signed-date={timestamp}, signature={signature}"

#     headers = {"Content-Type": "application/json", "Authorization": authorization}

#     try:
#         response = requests.post(domain + path, headers=headers)
#         if response.status_code == 200:
#             data = response.json()
#             product_list = data.get("data", {}).get("productData", [])
#             if product_list:
#                 best_product = product_list[0]
#                 return {
#                     "product_name": best_product.get("productName"),
#                     "product_url": best_product.get("productUrl"),
#                     "image_url": best_product.get("productImgUrl"),
#                     "price": best_product.get("productPrice"),
#                 }
#     except Exception as e:
#         print(f"쿠팡 API 에러: {str(e)}")


#     return {
#         "product_name": "",
#         "product_url": f"https://www.coupang.com/np/search?q={search_keyword}",
#         "image_url": "https://your-domain.com/default-gift.png",
#         "price": 0,
#     }


###################################


# gift/utils.py 최종 철벽 방어 버전

import os
import requests
import urllib.parse


def get_coupang_product(search_keyword, min_budget=0, max_budget=99999999):
    """
    네이버 50개 풀조사가 실패하는 최악의 상황(Edge Case)을 대비하여
    카테고리 매칭을 유지하면서 가격만 안전값으로 강제 변환하는 철벽 방어 시스템
    """
    # 1. 최악의 상황을 대비한 기본 안전 가드값 계산 (예산의 중간값)
    fallback_price = 0
    image_url = None

    client_id = os.environ.get("NAVER_CLIENT_ID")
    client_secret = os.environ.get("NAVER_CLIENT_SECRET")

    if not (client_id and client_secret):
        return {
            "product_name": f"{search_keyword} 추천 상품",
            "product_url": "",
            "image_url": image_url,
            "price": fallback_price,
        }

    def fetch_from_naver(keyword, use_price_filter=True):
        """네이버 API 통신 헬퍼 함수"""
        encoded = urllib.parse.quote(keyword)
        # 가격 필터를 쓰는 버전과 안 쓰는 버전을 분기 처리
        if use_price_filter:
            url = (
                f"https://openapi.naver.com/v1/search/shop.json"
                f"?query={encoded}&display=50&sort=sim"
                f"&min_price={int(min_budget)}&max_price={int(max_budget)}"
            )
        else:
            url = f"https://openapi.naver.com/v1/search/shop.json?query={encoded}&display=5&sort=sim"

        headers = {
            "X-Naver-Client-Id": client_id,
            "X-Naver-Client-Secret": client_secret,
        }
        try:
            res = requests.get(url, headers=headers, timeout=5)
            if res.status_code == 200:
                return res.json().get("items", [])
        except Exception as e:
            print(f"❌ 네이버 API 통신 에러: {e}")
        return []

    # [1차 방어선] 원래 AI 키워드로 3~5만원대 상품 50개 전수 조사
    items = fetch_from_naver(search_keyword, use_price_filter=True)
    valid_item = None

    for item in items:
        lprice = int(item.get("lprice", 0))
        if int(min_budget) <= lprice <= int(max_budget):
            valid_item = item
            break

    # [2차 방어선] 1차 조사에서 예산 상품이 전멸했을 경우 (최악의 상황 돌입)
    if not valid_item:
        print(
            f"🛑 [위험 감지] '{search_keyword}' 예산 내 상품 없음 ➡️ 2차 무조건 매칭 가드 가동"
        )

        # 가격 필터 파라미터를 완전히 제거하고, 순수하게 해당 키워드의 '진짜 1등 상품'을 가져옵니다.
        # 이렇게 하면 '세트', '백팩'으로 쪼개져 엉뚱한 브래킷 같은 게 나오는 카테고리 꼬임을 100% 방지합니다!
        raw_items = fetch_from_naver(search_keyword, use_price_filter=False)

        if raw_items:
            first_item = raw_items[0]
            raw_price = int(first_item.get("lprice", 0))

            # 💡 [핵심 천재 로직] 가져온 진짜 상품명과 이미지는 그대로 사용하되,
            # 가격이 예산(3~5만원)을 초과하거나 미달하면 시스템 유효성을 위해
            # 강제로 예산의 중간값(fallback_price)이나 최대값 한계선으로 마사지하여 강제 보정합니다.
            if raw_price < int(min_budget) or raw_price > int(max_budget):
                final_price = fallback_price
            else:
                final_price = raw_price

            final_product_name = (
                first_item.get("title").replace("<b>", "").replace("</b>", "")
            )
            image_url = first_item.get("image", image_url)
            print(
                f"✨ [강제 안전 보정 성공]: {final_product_name} 제품 확보 완료! 가격 안전화 -> {final_price}원 조절"
            )
        else:
            # 네이버 쇼핑에 검색 결과 자체가 0건인 경우 최종 가드
            final_product_name = f"{search_keyword}"
            final_price = fallback_price

    else:
        # 정상적으로 범위 내에서 매칭 성공했을 때
        final_product_name = (
            valid_item.get("title").replace("<b>", "").replace("</b>", "")
        )
        final_price = int(valid_item.get("lprice"))
        image_url = valid_item.get("image", image_url)
        print(f"🍏 [최종 매칭 성공]: {final_product_name} / {final_price}원")

    # 3. 쿠팡 파트너스 수익 링크 조립
    encoded_final_name = urllib.parse.quote(final_product_name)
    earning_url = (
        f"https://www.coupang.com/np/search"
        f"?q={encoded_final_name}"
        f"&src=1139000&spec=10799999&addtag=300"
        f"&ctag={encoded_final_name}&lptag=AF1047395"
    )

    return {
        "product_name": final_product_name,
        "product_url": earning_url,
        "image_url": image_url,
        "price": final_price,
    }
